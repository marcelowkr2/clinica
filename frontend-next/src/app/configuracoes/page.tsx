'use client';

import { useEffect, useState } from 'react';
import { 
  Settings, 
  Save, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Printer,
  Smartphone,
  Monitor,
  User,
  Key,
  AlertTriangle
} from 'lucide-react';
import { VetLayout } from '@/components/ui/VetLayout';

interface ConfiguracaoGeral {
  nome_clinica: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  site: string;
  horario_funcionamento: {
    segunda: { inicio: string; fim: string; ativo: boolean };
    terca: { inicio: string; fim: string; ativo: boolean };
    quarta: { inicio: string; fim: string; ativo: boolean };
    quinta: { inicio: string; fim: string; ativo: boolean };
    sexta: { inicio: string; fim: string; ativo: boolean };
    sabado: { inicio: string; fim: string; ativo: boolean };
    domingo: { inicio: string; fim: string; ativo: boolean };
  };
}

interface ConfiguracaoFinanceira {
  moeda: string;
  taxa_cartao: number;
  desconto_maximo: number;
  forma_pagamento_padrao: string;
  vencimento_padrao: number;
}

interface ConfiguracaoNotificacao {
  email_agendamentos: boolean;
  sms_lembretes: boolean;
  notificacao_vencimentos: boolean;
  relatorio_diario: boolean;
  backup_automatico: boolean;
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('geral');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [configGeral, setConfigGeral] = useState<ConfiguracaoGeral>({
    nome_clinica: 'VetHub Central',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    telefone: '(11) 3456-7890',
    email: 'contato@vethub.com',
    site: 'www.vethub.com',
    horario_funcionamento: {
      segunda: { inicio: '08:00', fim: '18:00', ativo: true },
      terca: { inicio: '08:00', fim: '18:00', ativo: true },
      quarta: { inicio: '08:00', fim: '18:00', ativo: true },
      quinta: { inicio: '08:00', fim: '18:00', ativo: true },
      sexta: { inicio: '08:00', fim: '18:00', ativo: true },
      sabado: { inicio: '08:00', fim: '14:00', ativo: true },
      domingo: { inicio: '08:00', fim: '12:00', ativo: false }
    }
  });

  const [configFinanceira, setConfigFinanceira] = useState<ConfiguracaoFinanceira>({
    moeda: 'BRL',
    taxa_cartao: 3.5,
    desconto_maximo: 20,
    forma_pagamento_padrao: 'dinheiro',
    vencimento_padrao: 30
  });

  const [configNotificacao, setConfigNotificacao] = useState<ConfiguracaoNotificacao>({
    email_agendamentos: true,
    sms_lembretes: true,
    notificacao_vencimentos: true,
    relatorio_diario: false,
    backup_automatico: true
  });

  const handleSave = async () => {
    setLoading(true);
    
    // Simular salvamento
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'geral', name: 'Geral', icon: Building },
    { id: 'financeiro', name: 'Financeiro', icon: DollarSign },
    { id: 'notificacoes', name: 'Notificações', icon: Bell },
    { id: 'seguranca', name: 'Segurança', icon: Shield },
    { id: 'sistema', name: 'Sistema', icon: Database }
  ];

  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  return (
    <VetLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configure as preferências do sistema</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-green-400">✓</div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Configurações salvas com sucesso!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'geral' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Clínica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Clínica
                      </label>
                      <input
                        type="text"
                        value={configGeral.nome_clinica}
                        onChange={(e) => setConfigGeral({...configGeral, nome_clinica: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        value={configGeral.cnpj}
                        onChange={(e) => setConfigGeral({...configGeral, cnpj: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={configGeral.endereco}
                        onChange={(e) => setConfigGeral({...configGeral, endereco: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={configGeral.cidade}
                        onChange={(e) => setConfigGeral({...configGeral, cidade: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={configGeral.estado}
                        onChange={(e) => setConfigGeral({...configGeral, estado: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="SP">São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                        {/* Adicionar outros estados */}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={configGeral.cep}
                        onChange={(e) => setConfigGeral({...configGeral, cep: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={configGeral.telefone}
                        onChange={(e) => setConfigGeral({...configGeral, telefone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={configGeral.email}
                        onChange={(e) => setConfigGeral({...configGeral, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site
                      </label>
                      <input
                        type="text"
                        value={configGeral.site}
                        onChange={(e) => setConfigGeral({...configGeral, site: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Horário de Funcionamento</h3>
                  <div className="space-y-4">
                    {diasSemana.map((dia) => (
                      <div key={dia.key} className="flex items-center gap-4">
                        <div className="w-32">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento].ativo}
                              onChange={(e) => setConfigGeral({
                                ...configGeral,
                                horario_funcionamento: {
                                  ...configGeral.horario_funcionamento,
                                  [dia.key]: {
                                    ...configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento],
                                    ativo: e.target.checked
                                  }
                                }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">{dia.label}</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento].inicio}
                            onChange={(e) => setConfigGeral({
                              ...configGeral,
                              horario_funcionamento: {
                                ...configGeral.horario_funcionamento,
                                [dia.key]: {
                                  ...configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento],
                                  inicio: e.target.value
                                }
                              }
                            })}
                            disabled={!configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento].ativo}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <span className="text-gray-500">às</span>
                          <input
                            type="time"
                            value={configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento].fim}
                            onChange={(e) => setConfigGeral({
                              ...configGeral,
                              horario_funcionamento: {
                                ...configGeral.horario_funcionamento,
                                [dia.key]: {
                                  ...configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento],
                                  fim: e.target.value
                                }
                              }
                            })}
                            disabled={!configGeral.horario_funcionamento[dia.key as keyof typeof configGeral.horario_funcionamento].ativo}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Financeiras</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Moeda
                      </label>
                      <select
                        value={configFinanceira.moeda}
                        onChange={(e) => setConfigFinanceira({...configFinanceira, moeda: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="BRL">Real (R$)</option>
                        <option value="USD">Dólar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa do Cartão (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={configFinanceira.taxa_cartao}
                        onChange={(e) => setConfigFinanceira({...configFinanceira, taxa_cartao: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desconto Máximo (%)
                      </label>
                      <input
                        type="number"
                        value={configFinanceira.desconto_maximo}
                        onChange={(e) => setConfigFinanceira({...configFinanceira, desconto_maximo: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Forma de Pagamento Padrão
                      </label>
                      <select
                        value={configFinanceira.forma_pagamento_padrao}
                        onChange={(e) => setConfigFinanceira({...configFinanceira, forma_pagamento_padrao: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao_credito">Cartão de Crédito</option>
                        <option value="cartao_debito">Cartão de Débito</option>
                        <option value="pix">PIX</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vencimento Padrão (dias)
                      </label>
                      <input
                        type="number"
                        value={configFinanceira.vencimento_padrao}
                        onChange={(e) => setConfigFinanceira({...configFinanceira, vencimento_padrao: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notificacoes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Notificação</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email para Agendamentos</p>
                          <p className="text-sm text-gray-500">Receber notificações por email sobre novos agendamentos</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configNotificacao.email_agendamentos}
                          onChange={(e) => setConfigNotificacao({...configNotificacao, email_agendamentos: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">SMS Lembretes</p>
                          <p className="text-sm text-gray-500">Enviar lembretes por SMS para clientes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configNotificacao.sms_lembretes}
                          onChange={(e) => setConfigNotificacao({...configNotificacao, sms_lembretes: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Notificação de Vencimentos</p>
                          <p className="text-sm text-gray-500">Alertas sobre contas e pagamentos vencidos</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configNotificacao.notificacao_vencimentos}
                          onChange={(e) => setConfigNotificacao({...configNotificacao, notificacao_vencimentos: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Monitor className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Relatório Diário</p>
                          <p className="text-sm text-gray-500">Receber relatório diário de atividades</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configNotificacao.relatorio_diario}
                          onChange={(e) => setConfigNotificacao({...configNotificacao, relatorio_diario: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Backup Automático</p>
                          <p className="text-sm text-gray-500">Realizar backup automático dos dados</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configNotificacao.backup_automatico}
                          onChange={(e) => setConfigNotificacao({...configNotificacao, backup_automatico: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguranca' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Segurança</h3>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Configurações de Segurança
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              As configurações de segurança devem ser alteradas com cuidado. 
                              Consulte o administrador do sistema antes de fazer alterações.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tempo de Sessão (minutos)
                        </label>
                        <input
                          type="number"
                          defaultValue={30}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tentativas de Login
                        </label>
                        <input
                          type="number"
                          defaultValue={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</p>
                          <p className="text-sm text-gray-500">Adicionar uma camada extra de segurança</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Configurar
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Log de Auditoria</p>
                          <p className="text-sm text-gray-500">Registrar todas as ações dos usuários</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sistema' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Sistema</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Idioma do Sistema
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fuso Horário
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                          <option value="America/New_York">New York (GMT-5)</option>
                          <option value="Europe/London">London (GMT+0)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Modo de Manutenção</p>
                          <p className="text-sm text-gray-500">Bloquear acesso ao sistema para manutenção</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Backup Automático</p>
                          <p className="text-sm text-gray-500">Realizar backup diário dos dados</p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Configurar
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Limpar Cache</p>
                          <p className="text-sm text-gray-500">Limpar cache do sistema para melhor performance</p>
                        </div>
                        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                          Limpar Agora
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Exportar Dados</p>
                          <p className="text-sm text-gray-500">Exportar todos os dados do sistema</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Exportar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VetLayout>
  );
}