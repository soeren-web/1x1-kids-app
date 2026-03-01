import React, { useState } from 'react'

const COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC857', '#A8E063',
  '#56CCF2', '#6C63FF', '#F953C6', '#FF6B9D',
  '#00C9A7', '#845EC2',
]

export default function MultiplicationTable({ onBack }) {
  const [highlighted, setHighlighted] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  const numbers = Array.from({ length: 10 }, (_, i) => i + 1)

  function handleCellClick(a, b) {
    setHighlighted({ a, b, result: a * b })
  }

  function getColor(row) {
    return COLORS[(row - 1) % COLORS.length]
  }

  return (
    <div className="table-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Zurück</button>
        <h2>Das Einmaleins</h2>
      </div>

      <div className="row-selector">
        <span>Reihe auswählen:</span>
        <div className="row-buttons">
          {numbers.map(n => (
            <button
              key={n}
              className={`row-btn ${selectedRow === n ? 'active' : ''}`}
              style={selectedRow === n ? { background: getColor(n), color: 'white' } : {}}
              onClick={() => setSelectedRow(selectedRow === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {highlighted && (
        <div className="highlight-banner">
          <span className="highlight-equation">
            {highlighted.a} × {highlighted.b} = <strong>{highlighted.result}</strong>
          </span>
        </div>
      )}

      <div className="table-container">
        <table className="mult-table">
          <thead>
            <tr>
              <th className="corner-cell">×</th>
              {numbers.map(n => (
                <th key={n} className="header-cell">{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numbers.map(row => (
              <tr
                key={row}
                className={selectedRow === null || selectedRow === row ? '' : 'row-dimmed'}
              >
                <th className="row-header" style={{ color: getColor(row) }}>{row}</th>
                {numbers.map(col => {
                  const isHighlighted = highlighted && highlighted.a === row && highlighted.b === col
                  const isInSelectedRow = selectedRow === row
                  return (
                    <td
                      key={col}
                      className={`table-cell ${isHighlighted ? 'cell-highlighted' : ''} ${isInSelectedRow ? 'cell-in-row' : ''}`}
                      style={isInSelectedRow ? { background: getColor(row) + '33', borderColor: getColor(row) } : {}}
                      onClick={() => handleCellClick(row, col)}
                    >
                      {row * col}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRow && (
        <div className="row-list" style={{ borderColor: getColor(selectedRow) }}>
          <h3 style={{ color: getColor(selectedRow) }}>Die {selectedRow}er Reihe</h3>
          <div className="row-equations">
            {numbers.map(n => (
              <div key={n} className="row-equation">
                <span>{selectedRow} × {n} = <strong>{selectedRow * n}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
