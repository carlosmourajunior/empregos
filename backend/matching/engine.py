import re
from typing import List, Dict, Tuple
from difflib import SequenceMatcher
from django.db.models import Q
from curriculos.models import Curriculo
from vagas.models import Vaga, RequisitoVaga
from .models import MatchingResult

class MatchingEngine:
    """Engine de matching entre currículos e vagas"""
    
    def __init__(self):
        self.pesos = {
            'experiencia': 0.3,
            'habilidades': 0.25,
            'escolaridade': 0.2,
            'localizacao': 0.15,
            'salario': 0.1
        }
    
    def calcular_matching_vaga(self, vaga: Vaga) -> List[MatchingResult]:
        """Calcula matching para todos os candidatos de uma vaga"""
        # Buscar currículos de trabalhadores ativos e aprovados
        curriculos = Curriculo.objects.filter(
            trabalhador__tipo_usuario='trabalhador',
            trabalhador__aprovado=True,
            trabalhador__ativo=True
        ).select_related('trabalhador').prefetch_related(
            'experiencias', 'habilidades', 'escolaridades',
            'tipo_vaga_procurada'
        )
        
        results = []
        for curriculo in curriculos:
            score_data = self._calcular_score_curriculo_vaga(curriculo, vaga)
            
            # Salvar ou atualizar resultado
            matching_result, created = MatchingResult.objects.update_or_create(
                vaga=vaga,
                trabalhador=curriculo.trabalhador,
                defaults=score_data
            )
            results.append(matching_result)
        
        return sorted(results, key=lambda x: x.score_total, reverse=True)
    
    def _calcular_score_curriculo_vaga(self, curriculo: Curriculo, vaga: Vaga) -> Dict:
        """Calcula o score de compatibilidade entre um currículo e uma vaga"""
        
        # Calcular scores individuais
        score_experiencia = self._score_experiencia(curriculo, vaga)
        score_habilidades = self._score_habilidades(curriculo, vaga)
        score_escolaridade = self._score_escolaridade(curriculo, vaga)
        score_localizacao = self._score_localizacao(curriculo, vaga)
        score_salario = self._score_salario(curriculo, vaga)
        
        # Calcular score total
        score_total = (
            score_experiencia * self.pesos['experiencia'] +
            score_habilidades * self.pesos['habilidades'] +
            score_escolaridade * self.pesos['escolaridade'] +
            score_localizacao * self.pesos['localizacao'] +
            score_salario * self.pesos['salario']
        )
        
        # Detalhes para debugging
        detalhes = {
            'area_compativel': self._verifica_area_compativel(curriculo, vaga),
            'nivel_experiencia_compativel': self._verifica_nivel_experiencia(curriculo, vaga),
            'requisitos_atendidos': self._verifica_requisitos(curriculo, vaga),
            'salario_compativel': score_salario > 0.5,
        }
        
        return {
            'score_total': round(score_total, 2),
            'score_experiencia': round(score_experiencia, 2),
            'score_habilidades': round(score_habilidades, 2),
            'score_escolaridade': round(score_escolaridade, 2),
            'score_localizacao': round(score_localizacao, 2),
            'score_salario': round(score_salario, 2),
            'detalhes_matching': detalhes
        }
    
    def _score_experiencia(self, curriculo: Curriculo, vaga: Vaga) -> float:
        """Calcula score baseado na experiência profissional"""
        experiencias = curriculo.experiencias.all()
        
        if not experiencias:
            return 0.0
        
        score = 0.0
        total_anos = 0
        
        # Calcular anos totais de experiência
        for exp in experiencias:
            if exp.data_fim:
                anos = (exp.data_fim - exp.data_inicio).days / 365
            else:  # Emprego atual
                from datetime import date
                anos = (date.today() - exp.data_inicio).days / 365
            total_anos += anos
            
            # Bonus se experiência na mesma área
            if self._similar_text(exp.cargo, vaga.titulo) > 0.6:
                score += 0.3
            
            # Bonus por área relacionada
            if vaga.area.lower() in exp.descricao.lower():
                score += 0.2
        
        # Score baseado no nível de experiência requerido
        nivel_map = {
            'estagiario': 0,
            'junior': 2,
            'pleno': 5,
            'senior': 8,
            'especialista': 12
        }
        
        anos_requeridos = nivel_map.get(vaga.nivel_experiencia, 2)
        
        if total_anos >= anos_requeridos:
            score += 0.5
        else:
            score += (total_anos / anos_requeridos) * 0.5
        
        return min(score, 1.0)
    
    def _score_habilidades(self, curriculo: Curriculo, vaga: Vaga) -> float:
        """Calcula score baseado nas habilidades"""
        habilidades_curriculo = [h.nome.lower() for h in curriculo.habilidades.all()]
        
        if not habilidades_curriculo:
            return 0.0
        
        # Extrair habilidades dos requisitos da vaga
        requisitos_texto = f"{vaga.requisitos} {vaga.descricao}".lower()
        
        score = 0.0
        habilidades_encontradas = 0
        
        for habilidade in habilidades_curriculo:
            if habilidade in requisitos_texto:
                habilidades_encontradas += 1
                score += 0.1
        
        # Bonus baseado na porcentagem de habilidades relevantes
        if habilidades_encontradas > 0:
            score += (habilidades_encontradas / len(habilidades_curriculo)) * 0.5
        
        return min(score, 1.0)
    
    def _score_escolaridade(self, curriculo: Curriculo, vaga: Vaga) -> float:
        """Calcula score baseado na escolaridade"""
        escolaridades = curriculo.escolaridades.all()
        
        if not escolaridades:
            return 0.3  # Score básico se não informado
        
        # Mapear níveis de escolaridade para pontuação
        nivel_map = {
            'fundamental_incompleto': 1,
            'fundamental_completo': 2,
            'medio_incompleto': 3,
            'medio_completo': 4,
            'tecnico': 5,
            'superior_incompleto': 6,
            'superior_completo': 7,
            'pos_graduacao': 8,
            'mestrado': 9,
            'doutorado': 10
        }
        
        maior_nivel = max([nivel_map.get(e.nivel, 1) for e in escolaridades])
        
        # Score baseado no nível (normalizado para 0-1)
        score = maior_nivel / 10.0
        
        # Bonus se curso relacionado à área da vaga
        for escolaridade in escolaridades:
            if self._similar_text(escolaridade.curso, vaga.area) > 0.5:
                score += 0.2
                break
        
        return min(score, 1.0)
    
    def _score_localizacao(self, curriculo: Curriculo, vaga: Vaga) -> float:
        """Calcula score baseado na localização"""
        # Se aceita remoto, localização não é problema
        if vaga.aceita_remoto:
            return 1.0
        
        # Se trabalhador tem perfil e endereço
        if hasattr(curriculo.trabalhador, 'perfil_trabalhador'):
            endereco_trabalhador = curriculo.trabalhador.perfil_trabalhador.endereco.lower()
            local_vaga = vaga.local_trabalho.lower()
            
            # Verificar se são da mesma cidade/região
            if self._similar_text(endereco_trabalhador, local_vaga) > 0.6:
                return 1.0
            
            # Verificar disponibilidade para mudança
            if curriculo.disponibilidade_mudanca:
                return 0.7
            
            return 0.3
        
        return 0.5  # Score neutro se não informado
    
    def _score_salario(self, curriculo: Curriculo, vaga: Vaga) -> float:
        """Calcula score baseado na compatibilidade salarial"""
        # Se vaga não informa salário
        if not vaga.salario_min and not vaga.salario_max:
            return 0.8
        
        # Se currículo não tem pretensão salarial
        if not curriculo.pretensao_salarial:
            return 0.6
        
        pretensao = float(curriculo.pretensao_salarial)
        salario_min = float(vaga.salario_min or 0)
        salario_max = float(vaga.salario_max or pretensao * 2)
        
        # Se pretensão está dentro da faixa
        if salario_min <= pretensao <= salario_max:
            return 1.0
        
        # Se pretensão é menor que o mínimo (bom para empresa)
        if pretensao < salario_min:
            return 0.9
        
        # Se pretensão é maior que o máximo
        if pretensao > salario_max:
            # Score baseado na diferença
            diferenca_percentual = (pretensao - salario_max) / salario_max
            return max(0.0, 1.0 - diferenca_percentual)
        
        return 0.5
    
    def _verifica_area_compativel(self, curriculo: Curriculo, vaga: Vaga) -> bool:
        """Verifica se a área da vaga é compatível com o interesse do trabalhador"""
        if hasattr(curriculo, 'tipo_vaga_procurada') and curriculo.tipo_vaga_procurada:
            areas_interesse = curriculo.tipo_vaga_procurada.areas_interesse.lower()
            return vaga.area.lower() in areas_interesse
        return False
    
    def _verifica_nivel_experiencia(self, curriculo: Curriculo, vaga: Vaga) -> bool:
        """Verifica se o nível de experiência é compatível"""
        experiencias = curriculo.experiencias.all()
        total_anos = 0
        
        for exp in experiencias:
            if exp.data_fim:
                anos = (exp.data_fim - exp.data_inicio).days / 365
            else:
                from datetime import date
                anos = (date.today() - exp.data_inicio).days / 365
            total_anos += anos
        
        nivel_map = {
            'estagiario': 0,
            'junior': 2,
            'pleno': 5,
            'senior': 8,
            'especialista': 12
        }
        
        return total_anos >= nivel_map.get(vaga.nivel_experiencia, 0)
    
    def _verifica_requisitos(self, curriculo: Curriculo, vaga: Vaga) -> Dict:
        """Verifica quais requisitos da vaga são atendidos pelo currículo"""
        requisitos_atendidos = {
            'obrigatorios': 0,
            'desejaveis': 0,
            'diferenciais': 0
        }
        
        # Se vaga tem requisitos detalhados
        if hasattr(vaga, 'requisitos_detalhados'):
            for requisito in vaga.requisitos_detalhados.all():
                atendido = self._verifica_requisito_especifico(curriculo, requisito)
                if atendido:
                    if requisito.nivel_importancia == 'obrigatorio':
                        requisitos_atendidos['obrigatorios'] += 1
                    elif requisito.nivel_importancia == 'desejavel':
                        requisitos_atendidos['desejaveis'] += 1
                    else:
                        requisitos_atendidos['diferenciais'] += 1
        
        return requisitos_atendidos
    
    def _verifica_requisito_especifico(self, curriculo: Curriculo, requisito) -> bool:
        """Verifica se um requisito específico é atendido"""
        if requisito.tipo == 'habilidade':
            habilidades = [h.nome.lower() for h in curriculo.habilidades.all()]
            return requisito.descricao.lower() in ' '.join(habilidades)
        
        elif requisito.tipo == 'habilitacao':
            if hasattr(curriculo.trabalhador, 'perfil_trabalhador'):
                return curriculo.trabalhador.perfil_trabalhador.tem_habilitacao
        
        # Implementar outras verificações conforme necessário
        return False
    
    def _similar_text(self, text1: str, text2: str) -> float:
        """Calcula similaridade entre dois textos"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    def get_top_candidatos(self, vaga: Vaga, limit: int = 10) -> List[MatchingResult]:
        """Retorna os top candidatos para uma vaga"""
        return MatchingResult.objects.filter(
            vaga=vaga,
            score_total__gte=0.3  # Threshold mínimo
        ).order_by('-score_total')[:limit]
    
    def get_vagas_recomendadas(self, trabalhador, limit: int = 10) -> List[MatchingResult]:
        """Retorna vagas recomendadas para um trabalhador"""
        return MatchingResult.objects.filter(
            trabalhador=trabalhador,
            vaga__status='ativa',
            score_total__gte=0.3
        ).order_by('-score_total')[:limit]
