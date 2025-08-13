import React, { useState } from 'react'
import './Formatador.css'

const Formatador = () => {
  const [entrada, setEntrada] = useState('')
  const [limpo, setLimpo] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [mostrarNotas, setMostrarNotas] = useState(false)
  const [mostrarCnpj, setMostrarCnpj] = useState(false)
  const [textoTransformado, setTextoTransformado] = useState('')
  const [textoCopiado, setTextoCopiado] = useState(false)





  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const original = e.target.value
    const somenteNumeros = original.replace(/[^\d]/g, '')
    setEntrada(original)
    setLimpo(somenteNumeros)
    setCopiado(false)
  }

  const copiar = () => {
    navigator.clipboard.writeText(limpo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  const limpar = () => {
    setEntrada('')
    setLimpo('')
    setCopiado(false)
  }

  const abrirLink = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="formatador-container">
      <h2>🔎 Formatador de Chaves e CNPJ</h2>

      <textarea
        value={entrada}
        onChange={handleChange}
        className="formatador-textarea"
        style={{ resize: 'none' }}
      />

      {limpo && (
        <>
          <div className="formatador-resultado">
            <strong>🔢 Resultado:</strong>
            <p>{limpo}</p>
          </div>

          <div className="formatador-botoes">
            <button onClick={copiar} className="formatador-botao">📋 Copiar</button>
            <button onClick={limpar} className="formatador-botao limpar">🧹 Limpar</button>
          </div>

          {copiado && <span className="formatador-feedback">✅ Copiado!</span>}
        </>
      )}

      <h3>🔗 Links úteis</h3>

      <div className="formatador-links">
        <button
          className="dropdown-toggle"
          onClick={() => setMostrarNotas(!mostrarNotas)}
        >
          📑 Notas Fiscais / CTe
        </button>
        {mostrarNotas && (
          <div className="link-buttons">
            <button onClick={() => abrirLink('https://consultadanfe.com/')}>Consulta DANFE</button>
            <button onClick={() => abrirLink('https://www.meudanfe.com.br/')}>Meu DANFE</button>
            <button onClick={() => abrirLink('https://www.danfeonline.com.br/')}>DANFE Online</button>
            <button onClick={() => abrirLink('https://danferapida.com.br/')}>DANFE Rápida</button>
            <button onClick={() => abrirLink('https://www.fsist.com.br/')}>FSist</button>
            <button onClick={() => abrirLink('https://www.cte.fazenda.gov.br/portal/')}>Portal CTe</button>
            <button onClick={() => abrirLink('https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g=')}>Portal Danfe</button>
          </div>
        )}

        <button
          className="dropdown-toggle"
          onClick={() => setMostrarCnpj(!mostrarCnpj)}
        >
          🧾 CNPJ
        </button>
        {mostrarCnpj && (
          <div className="link-buttons">
            <button onClick={() => abrirLink('https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_Solicitacao.asp')}>Receita Federal</button>
            <button onClick={() => abrirLink('https://cnpja.com/')}>CNPJá</button>
            <button onClick={() => abrirLink('https://consultacnpj.com/')}>Consulta CNPJ</button>
            <button onClick={() => abrirLink('http://www.sintegra.gov.br/')}>SINTEGRA</button>
          </div>
        )}
      </div>

      {/* Transformador de Texto */}
      <div className="formatador-transformador">
        <h3>🛠️ Transformador de Texto</h3>
        <input
          type="text"
          placeholder="Digite aqui..."
          value={textoTransformado}
          onChange={e => setTextoTransformado(e.target.value)}
          className="formatador-input"
        />

        <div className="formatador-botoes">
          <button onClick={() => setTextoTransformado(textoTransformado.toUpperCase())}>MAIÚSCULO</button>
          <button onClick={() => setTextoTransformado(textoTransformado.toLowerCase())}>minúsculo</button>
          <button onClick={() => setTextoTransformado(
            textoTransformado.replace(/\b\w/g, char => char.toUpperCase())
          )}>Capitalize</button>
          <button onClick={() => setTextoTransformado(
            textoTransformado.split('').map(char => {
              const italicMap: Record<string, string> = {
                a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨',
                h: '𝘩', i: '𝘪', j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮', n: '𝘯',
                o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳', s: '𝘴', t: '𝘵', u: '𝘶',
                v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻',
                A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎',
                H: '𝘏', I: '𝘐', J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔', N: '𝘕',
                O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙', S: '𝘚', T: '𝘛', U: '𝘜',
                V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡',
              };
              return italicMap[char] || char;
            }).join('')
          )}>𝘐𝘵á𝘭𝘪𝘤𝘰</button>
          <button onClick={() => {
            navigator.clipboard.writeText(textoTransformado)
            setTextoCopiado(true)
            setTimeout(() => setTextoCopiado(false), 1500)
          }}>📋 Copiar</button>
          <button onClick={() => setTextoTransformado('')}>🧹 Limpar</button>
        </div>

        {textoCopiado && <span className="formatador-feedback">✅ Texto copiado!</span>}
      </div>


    </div>
  )
}

export default Formatador
