'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface NovoPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paciente: any) => void;
}

export function NovoPacienteModal({ isOpen, onClose, onSave }: NovoPacienteModalProps) {
  const [nome, setNome] = useState('');
  const [convenio, setConvenio] = useState('');
  const [plano, setPlano] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [peso, setPeso] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelEmail, setResponsavelEmail] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [responsavelEndereco, setResponsavelEndereco] = useState('');

  // Função para limpar todos os campos
  const limparCampos = () => {
    setNome('');
    setConvenio('');
    setPlano('');
    setDataNascimento('');
    setSexo('');
    setPeso('');
    setObservacoes('');
    setResponsavelNome('');
    setResponsavelEmail('');
    setResponsavelTelefone('');
    setResponsavelEndereco('');
  };

  // Função para fechar o modal e limpar os campos
  const handleClose = () => {
    limparCampos();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoPaciente = {
      nome,
      convenio,
      plano,
      dataNascimento,
      sexo,
      peso: peso ? parseFloat(peso) : null,
      observacoes,
      responsavel: {
        nome: responsavelNome,
        email: responsavelEmail,
        telefone: responsavelTelefone,
        endereco: responsavelEndereco
      }
    };
    
    onSave(novoPaciente);
    limparCampos();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border/50">
        <div className="flex justify-between items-center p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-bold text-foreground">Novo Paciente</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Preencha os dados para cadastrar um novo paciente humano.</p>
          </div>
          <button onClick={handleClose} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 border-b border-primary/10 pb-2">Informações do Paciente</h3>
              
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <label htmlFor="nome" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Nome Completo*</label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Ex: João da Silva"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <label htmlFor="convenio" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Convênio*</label>
                    <select
                      id="convenio"
                      value={convenio}
                      onChange={(e) => setConvenio(e.target.value)}
                      required
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Selecione</option>
                      <option value="Particular">Particular</option>
                      <option value="Unimed">Unimed</option>
                      <option value="Bradesco">Bradesco Saúde</option>
                      <option value="SulAmerica">SulAmérica</option>
                      <option value="Amil">Amil</option>
                      <option value="Cassi">Cassi</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-1.5">
                    <label htmlFor="plano" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Plano/Categoria</label>
                    <input
                      id="plano"
                      type="text"
                      value={plano}
                      onChange={(e) => setPlano(e.target.value)}
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Ex: Ouro, Básico..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <label htmlFor="dataNascimento" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Nascimento</label>
                    <input
                      id="dataNascimento"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="grid gap-1.5">
                    <label htmlFor="sexo" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Sexo</label>
                    <select
                      id="sexo"
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid gap-1.5">
                  <label htmlFor="peso" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Peso (kg)</label>
                  <input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600/70 border-b border-emerald-500/10 pb-2">Informações de Contato/Responsável</h3>
              
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <label htmlFor="responsavelNome" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Responsável* (ou o próprio)</label>
                  <input
                    id="responsavelNome"
                    type="text"
                    value={responsavelNome}
                    onChange={(e) => setResponsavelNome(e.target.value)}
                    required
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Nome completo do responsável"
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <label htmlFor="responsavelEmail" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                  <input
                    id="responsavelEmail"
                    type="email"
                    value={responsavelEmail}
                    onChange={(e) => setResponsavelEmail(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <label htmlFor="responsavelTelefone" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Telefone*</label>
                  <input
                    id="responsavelTelefone"
                    type="tel"
                    value={responsavelTelefone}
                    onChange={(e) => setResponsavelTelefone(e.target.value)}
                    required
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <label htmlFor="responsavelEndereco" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Endereço Residencial</label>
                  <textarea
                    id="responsavelEndereco"
                    value={responsavelEndereco}
                    onChange={(e) => setResponsavelEndereco(e.target.value)}
                    rows={2}
                    className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="Rua, número, complemento..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid gap-1.5">
            <label htmlFor="observacoes" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Observações Médicas / Alergias</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Descreva observações importantes, alergias ou histórico relevante..."
            />
          </div>
          
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border border-border/50 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
            >
              Cadastrar Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}