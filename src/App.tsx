import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css'
import { BsMoonStarsFill } from "react-icons/bs";
import { FaSun } from "react-icons/fa6";
import { ImRocket } from "react-icons/im";
import { RiKey2Fill } from "react-icons/ri";
import { MdMessage } from "react-icons/md";


function App() {
// modo claro e escuro
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
  }, [isDark]);


  // Estados principais
  const [frete, setFrete] = useState<string>('')
  const [taxa, setTaxa] = useState<string>('')
  const [resultado, setResultado] = useState<{
    valorICMS: number
    creditoPresumido: number
    icmsRecolher: number
  } | null>(null)

  // Modais
  const [showGuiaModal, setShowGuiaModal] = useState(false)
  const [showCteModal, setShowCteModal] = useState(false)

  // Estado Obs. Guia
  const [guiaNumero, setGuiaNumero] = useState('')
  const [guiaSerie, setGuiaSerie] = useState('')
  const [guiaMotorista, setGuiaMotorista] = useState('')
  const [guiaLinha, setGuiaLinha] = useState('')
  const [guiaSubmitted, setGuiaSubmitted] = useState(false)
  const [guiaCopied, setGuiaCopied] = useState(false)
  const [creditoPresumido, setCreditoPresumido] = useState('')


  // Estado Obs. CTe
  const [obsList, setObsList] = useState<string[]>([])
  
  const [cteSubmitted, setCteSubmitted] = useState(false)
  const [cteCopied, setCteCopied] = useState(false)

  // Formata número em R$
  const formatarRS = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Regex que permite só dígitos e até duas casas decimais
  const handleInput =
    (setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value
        if (/^\d*([.,]?\d{0,2})?$/.test(valor)) {
          setter(valor)
        }
      }

  // Cálculo de ICMS
  const calcularICMS = () => {
    const vFrete = parseFloat(frete.replace(',', '.')) || 0
    const vTaxa = parseFloat(taxa.replace(',', '.')) || 0
    const valorICMS = vFrete * (vTaxa / 100)
    const creditoPresumido = valorICMS * 0.2
    const icmsRecolher = valorICMS * 0.8
    setResultado({ valorICMS, creditoPresumido, icmsRecolher })
  }

  const limparTudo = () => {
    setFrete('')
    setTaxa('')
    setResultado(null)
  }

  // Funções Obs. Guia
  const openGuiaModal = () => {
    setShowGuiaModal(true)
    setGuiaSubmitted(false)
    setGuiaCopied(false)
    setGuiaNumero('')
    setGuiaSerie('')
    setGuiaMotorista('')
    setGuiaLinha('')
  }

  const closeGuiaModal = () => {
    setShowGuiaModal(false)
  }

  const clearGuia = () => {
    setGuiaNumero('')
    setGuiaSerie('')
    setGuiaMotorista('')
    setGuiaLinha('')
    setGuiaSubmitted(false)
    setGuiaCopied(false)
    setCreditoPresumido('')
    setCreditoPresumido('')
  }

  const copyGuiaToClipboard = () => {
    if (!resultado) return
    const lines = [
      `- CTE: ${guiaNumero}`,
      `- SERIE: ${guiaSerie}`,
      `- MOTORISTA: ${guiaMotorista}`,
      `- LINHA: ${guiaLinha}`,
      `- ${creditoPresumido}`,
      `- VALOR PRESTAÇÃO: ${formatarRS(parseFloat(frete.replace(',', '.')))}`,
      `- VALOR ICMS(${taxa}%): ${formatarRS(resultado.valorICMS)}`,
      `- CREDITO PRESUMIDO: ${formatarRS(resultado.creditoPresumido)}`,
      `- ICMS A RECOLHER: ${formatarRS(resultado.icmsRecolher)}`,
    ].join('\n')
    navigator.clipboard.writeText(lines)
    setGuiaCopied(true)
  }

  // Funções Obs. CTe
  const openCteModal = () => {
    setShowCteModal(true)
    setObsList([])
    
    setCteSubmitted(false)
    setCteCopied(false)
  }

  const closeCteModal = () => {
    setShowCteModal(false)
  }

  const addObsInput = () => {
    setObsList(prev => [...prev, ''])
  }

  const handleObsChange = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newList = [...obsList]
    newList[idx] = e.target.value
    setObsList(newList)
  }




  const clearCte = () => {
    setObsList([])
    
    setCteSubmitted(false)
    setCteCopied(false)
    setCreditoPresumido('')
  }

  const copyCteToClipboard = () => {
    if (!resultado) return;

    const parts = [
      ...obsList.map(text => `- ${text}`),    
        '- AO OCORRER SINISTRO LIGUE PARA A CENTRAL DO SEGURO ATRAVÉS DO TELEFONE 0800 772 2016',      
      creditoPresumido ? `- ${creditoPresumido}` : '',
      `- VALOR PRESTAÇÃO: ${formatarRS(parseFloat(frete.replace(',', '.')))} - VALOR ICMS(${taxa}%): ${formatarRS(resultado.valorICMS)}`,
      `- CREDITO PRESUMIDO: ${formatarRS(resultado.creditoPresumido)} - ICMS A RECOLHER: ${formatarRS(resultado.icmsRecolher)}`,
    ].filter(line => line !== '').join('\n');

    // Copia como texto plano (sem formatação)
    navigator.clipboard.writeText(parts);
    setCteCopied(true);
  };


  return (
    <div className="container">
       <button
        onClick={() => setIsDark(prev => !prev)}
        style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: isDark ? '#2196f3' : '#4caf50',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}

      >
        {isDark ? <BsMoonStarsFill />  : <FaSun />}
      </button>


      <div className="container_links">
        <Link className="message_trucker" to="/message">
          <button className="styled-button">
            <MdMessage /> Mensagem 
          </button>
        </Link>

        <Link className="formatador_link" to="/formatador">
          <button className="styled-button">
            <RiKey2Fill /> Formatador
          </button>
        </Link>

        <Link className="formatador_agile" to="/agile">
          <button className="styled-button">
            <ImRocket /> Agile
          </button>
        </Link>

        <Link className="formatador_agile" to="/extrator">
          <button className="styled-button">
            <ImRocket /> Extrator
          </button>
        </Link>

      </div>



      <h2 className="titulo"> <img className='agile_trucker' src="/Copilot_20250813_020239-removebg-preview.png" alt="truck" /> Cálculo de ICMS</h2>

      <div className="formulario">
        <input
          type="text"
          value={frete}
          onChange={handleInput(setFrete)}
          placeholder="Valor da Prestação"
          className="input"
        />
        <input
          type="text"
          value={taxa}
          onChange={handleInput(setTaxa)}
          placeholder="Alíquota de ICMS (%)"
          className="input"
        />
      </div>

      <div className="botoes">
        <button onClick={calcularICMS} className="botao calcular">
          Calcular
        </button>
        <button onClick={limparTudo} className="botao limpar">
          Limpar Tudo
        </button>
      </div>

      {resultado && (
        <div className="resultado">
          <p>
            <strong>Valor da Prestação:</strong> {formatarRS(parseFloat(frete.replace(',', '.')))}
          </p>
          <p>
            <strong>Valor do ICMS ({taxa}%):</strong> {formatarRS(resultado.valorICMS)}
          </p>
          <p>
            <strong>Crédito Presumido (20%):</strong> {formatarRS(resultado.creditoPresumido)}
          </p>
          <p>
            <strong>ICMS a Recolher (80%):</strong> {formatarRS(resultado.icmsRecolher)}
          </p>

          <div className="botoes">
            <button onClick={openGuiaModal} className="botao info">
              Obs. Guia
            </button>
            <button onClick={openCteModal} className="botao info">
              Obs. CTe
            </button>
          </div>
        </div>
      )}

      {showGuiaModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Observação Guia</h3>
              <button onClick={closeGuiaModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              {!guiaSubmitted ? (
                <>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Número do CTe"
                    value={guiaNumero}
                    onChange={e => setGuiaNumero(e.target.value)}
                  />
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Série do CTe"
                    value={guiaSerie}
                    onChange={e => setGuiaSerie(e.target.value)}
                  />
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Nome do Motorista"
                    value={guiaMotorista}
                    onChange={e => setGuiaMotorista(e.target.value)}
                  />
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Linha"
                    value={guiaLinha}
                    onChange={e => setGuiaLinha(e.target.value)}
                  />

                  <select
                    name="creditoPresumido"
                    id="creditoPresumido"
                    className='select-credito-presumido'
                    value={creditoPresumido}
                    onChange={(e) => setCreditoPresumido(e.target.value)}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="CREDITO PRESUMIDO REF. EMBASAMENTO LEGAL ART. 107 INCISO 37 CONVÊNIO 106/96">ESTADO MG</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO § 3º PELO CONV. ICMS 85/03">ESTADO PA</option>
                    <option value="ANEXO I AO DECRETO Nº 18.955, DE 22 DE DEZEMBRO DE 1997 - CADERNO III">ESTADO DF</option>
                    <option value="BASE DE CALCULO DO ICMS REDUZIDA, CONFORME ART. 87, INCISO XX-B, DO RICMS.">ESTADO RN</option>
                    <option value="CONVÊNIO ICMS 85/2003 ART. 3.2 DO REGULAMENTO DO PARANÁ">ESTADO PR</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO INCISO IV, DO ART. 57 DO RICMS-SE">ESTADO SE</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO INCISO IX, DO ART. 1 DO ANEXO 1.5 DO ANEXO 1.0 DO RICMS-MA">ESTADO MA</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO DECRETO Nº 24.333/97, E NO INCISO V DO ART. 64 DO DECRETO Nº 24.569, DE 31 DE JULHO DE 1997.">ESTADO CE</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO A ALINEA 'B' DO INCISO III DO ART. 270 DO RICMS/BA">ESTADO BA</option>
                    <option value="CREDITO PRESUMIDO CONF. DECRETO Nº 27815 DE 24/01/2001 COMBINADO AO CONVÊNIO ICMS 106/96.">ESTADO RJ</option>
                    <option value="CREDITO PRESUMIDO - TRANSPORTADORA NÃO OBRIGADO A INSCRIÇÃO DENTRO DO ESTADO DO PE CONF. ALÍNEA 'E' DO INC XI DO ART. 35 DO DECRETO 14876/91.">ESTADO PE</option>
                    <option value="CREDITO PRESUMIDO - PRESTADOR DE SERVIÇO DE TRANSPORTE NÃO OBRIGADO À INSCRIÇÃO NO CCICMS - CONF. § 3º, ART. 25 DO ANEXO II DO RICMS/SC">ESTADO SC</option>
                    <option value="CREDITO PRESUMIDO - PRESTADOR NÃO OBRIGADO À INSCRIÇÃO NESTA UF. ALINEA C, INC. III, ART. 56 DO RICMS/PI">ESTADO PI</option>
                    <option value="CREDITO PRESUMIDO - INCISO II, § 1º, DO ARTIGO 64 DO RCTE-GO">ESTADO GO</option>
                    <option value="CREDITO PRESUMIDO - INCISO 37 DO ARTIGO 107 DO RICMS/ES">ESTADO ES</option>
                    <option value="CREDITO PRESUMIDO - INCISO § 3º DO ARTIGO 11 DO ANEXO III DO RICMS-SP">ESTADO SP</option>
                  </select>

                  

                  <div className="modal-button-group">
                    <button onClick={() => setGuiaSubmitted(true)} className="botao calcular">
                      Concluir
                    </button>
                    <button onClick={clearGuia} className="botao limpar">
                      Limpar Tudo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>CTE: {guiaNumero}</p>
                  <p>SERIE: {guiaSerie}</p>
                  <p>MOTORISTA: {guiaMotorista}</p>
                  <p>LINHA: {guiaLinha}</p>
                  <p>{creditoPresumido}</p>
                  <p>VALOR PRESTAÇÃO: {formatarRS(parseFloat(frete.replace(',', '.')))}</p>
                  <p>VALOR ICMS({taxa}%): {formatarRS(resultado?.valorICMS || 0)}</p>
                  <p>CREDITO PRESUMIDO: {formatarRS(resultado?.creditoPresumido || 0)}</p>
                  <p>ICMS A RECOLHER: {formatarRS(resultado?.icmsRecolher || 0)}</p>

                  <div className="modal-button-group">
                    <button onClick={copyGuiaToClipboard} className="botao calcular">
                      Copiar
                    </button>
                    <button onClick={clearGuia} className="botao limpar">
                      Limpar Tudo
                    </button>
                  </div>
                  {guiaCopied && <span className="feedback">Copiado!</span>}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showCteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Observação CTe</h3>
              <button onClick={closeCteModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              {!cteSubmitted ? (
                <>
                  <div className="modal-button-group">

                    <button onClick={addObsInput} className="botao info">
                      Criar Input
                    </button>

                   

                  </div>


                  <select
                    name="creditoPresumido"
                    id="creditoPresumido"
                    className='select-credito-presumido'
                    value={creditoPresumido}
                    onChange={(e) => setCreditoPresumido(e.target.value)}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="CREDITO PRESUMIDO REF. EMBASAMENTO LEGAL ART. 107 INCISO 37 CONVÊNIO 106/96">ESTADO MG</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO § 3º PELO CONV. ICMS 85/03">ESTADO PA</option>
                    <option value="ANEXO I AO DECRETO Nº 18.955, DE 22 DE DEZEMBRO DE 1997 - CADERNO III">ESTADO DF</option>
                    <option value="BASE DE CALCULO DO ICMS REDUZIDA, CONFORME ART. 87, INCISO XX-B, DO RICMS.">ESTADO RN</option>
                    <option value="CONVÊNIO ICMS 85/2003 ART. 3.2 DO REGULAMENTO DO PARANÁ">ESTADO PR</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO INCISO IV, DO ART. 57 DO RICMS-SE">ESTADO SE</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO INCISO IX, DO ART. 1 DO ANEXO 1.5 DO ANEXO 1.0 DO RICMS-MA">ESTADO MA</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO DECRETO Nº 24.333/97, E NO INCISO V DO ART. 64 DO DECRETO Nº 24.569, DE 31 DE JULHO DE 1997.">ESTADO CE</option>
                    <option value="CREDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO A ALINEA 'B' DO INCISO III DO ART. 270 DO RICMS/BA">ESTADO BA</option>
                    <option value="CREDITO PRESUMIDO CONF. DECRETO Nº 27815 DE 24/01/2001 COMBINADO AO CONVÊNIO ICMS 106/96.">ESTADO RJ</option>
                    <option value="CREDITO PRESUMIDO - TRANSPORTADORA NÃO OBRIGADO A INSCRIÇÃO DENTRO DO ESTADO DO PE CONF. ALÍNEA 'E' DO INC XI DO ART. 35 DO DECRETO 14876/91.">ESTADO PE</option>
                    <option value="CREDITO PRESUMIDO - PRESTADOR DE SERVIÇO DE TRANSPORTE NÃO OBRIGADO À INSCRIÇÃO NO CCICMS - CONF. § 3º, ART. 25 DO ANEXO II DO RICMS/SC">ESTADO SC</option>
                    <option value="CREDITO PRESUMIDO - PRESTADOR NÃO OBRIGADO À INSCRIÇÃO NESTA UF. ALINEA C, INC. III, ART. 56 DO RICMS/PI">ESTADO PI</option>
                    <option value="CREDITO PRESUMIDO - INCISO II, § 1º, DO ARTIGO 64 DO RCTE-GO">ESTADO GO</option>
                    <option value="CREDITO PRESUMIDO - INCISO 37 DO ARTIGO 107 DO RICMS/ES">ESTADO ES</option>
                    <option value="CREDITO PRESUMIDO - INCISO § 3º DO ARTIGO 11 DO ANEXO III DO RICMS-SP">ESTADO SP</option>
                  </select>


                  {obsList.map((obs, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="modal-input"
                      placeholder={`Observação ${idx + 1}`}
                      value={obs}
                      onChange={handleObsChange(idx)}
                    />
                  ))}

                  <div className="modal-button-group">
                    <button onClick={() => setCteSubmitted(true)} className="botao calcular">
                      Concluir
                    </button>
                    <button onClick={clearCte} className="botao limpar">
                      Limpar Tudo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {obsList.map((obs, idx) => (
                    <p key={idx}>{obs}</p>
                  ))}
                 
                    <p>
                      AO OCORRER SINISTRO LIGUE PARA A CENTRAL DO SEGURO ATRAVÉS DO TELEFONE 0800 772 2016
                    </p>
                 
                  {creditoPresumido && <p> {creditoPresumido}</p>}
                  <p>
                    VALOR PRESTAÇÃO: {formatarRS(parseFloat(frete.replace(',', '.')))} - VALOR
                    ICMS({taxa}%): {formatarRS(resultado?.valorICMS || 0)}
                  </p>
                  <p>
                    CREDITO PRESUMIDO: {formatarRS(resultado?.creditoPresumido || 0)} - ICMS A
                    RECOLHER: {formatarRS(resultado?.icmsRecolher || 0)}
                  </p>

                  <div className="modal-button-group">
                    <button onClick={copyCteToClipboard} className="botao calcular">
                      Copiar
                    </button>
                    <button onClick={clearCte} className="botao limpar">
                      Limpar Tudo
                    </button>
                  </div>
                  {cteCopied && <span className="feedback">Copiado!</span>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App