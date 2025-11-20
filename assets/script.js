/* Modern interactive script for the AI playground and UI behaviors */

function $(s){return document.querySelector(s)}

const textInput = $('#textInput')
const analyzeBtn = $('#analyzeBtn')
const visualizeBtn = $('#visualizeBtn')
const clearBtn = $('#clearBtn')
const analysisDiv = $('#analysis')
const vizCanvas = $('#viz')
const themeToggle = $('#themeToggle')

function setLightTheme(enabled){
    if(enabled){
        document.documentElement.style.setProperty('--bg','#f7fafc')
        document.documentElement.style.setProperty('--card','#ffffff')
        document.documentElement.style.setProperty('--text','#081028')
        document.documentElement.style.setProperty('--muted','#475569')
        themeToggle.textContent = '☀️'
    } else {
        document.documentElement.style.removeProperty('--bg')
        document.documentElement.style.removeProperty('--card')
        document.documentElement.style.removeProperty('--text')
        document.documentElement.style.removeProperty('--muted')
        themeToggle.textContent = '🌙'
    }
}

themeToggle?.addEventListener('click', ()=>{
    const isLight = document.documentElement.style.getPropertyValue('--bg') === '' ? false : (document.documentElement.style.getPropertyValue('--bg') === '#f7fafc')
    setLightTheme(!isLight)
})

function analyzeText(text){
    if(!text) return {words:0, chars:0, reading:0, top:[], sentiment: 'Neutral'}
    const chars = text.length
    const tokens = text.toLowerCase().match(/[a-z\d']+/g) || []
    const words = tokens.length
    const freq = {}
    tokens.forEach(t => freq[t] = (freq[t]||0)+1)
    const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8)
    const reading = Math.max(1, Math.round(words / 200))

    // Naive sentiment using small lexicon
    const positives = new Set(['good','great','awesome','excellent','amazing','love','like','improve','positive','success','win'])
    const negatives = new Set(['bad','poor','worse','hate','problem','issue','negative','fail','failure'])
    let score = 0
    tokens.forEach(t => { if(positives.has(t)) score++; if(negatives.has(t)) score-- })
    const sentiment = score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral'
    return {words, chars, reading, top, sentiment}
}

function renderAnalysis(obj){
    if(!obj || (obj.words===0 && obj.chars===0)){
        analysisDiv.innerHTML = '<p class="muted">No text provided. Try pasting a paragraph and click Analyze.</p>'
        return
    }
    const topHtml = obj.top.map(([w,c])=>`<li><strong>${w}</strong>: ${c}</li>`).join('')
    analysisDiv.innerHTML = `
        <div><strong>Words:</strong> ${obj.words} &nbsp; <strong>Chars:</strong> ${obj.chars} &nbsp; <strong>Est. read:</strong> ${obj.reading} min</div>
        <div style="margin-top:.6rem"><strong>Sentiment:</strong> ${obj.sentiment}</div>
        <div style="margin-top:.6rem"><strong>Top tokens:</strong><ul>${topHtml}</ul></div>
    `
}

function hashVector(word, dim=8){
    const vec = new Array(dim).fill(0)
    for(let i=0;i<word.length;i++){
        const code = word.charCodeAt(i)
        vec[i % dim] += (code % 97) + (i%7)
    }
    // normalize
    const norm = Math.sqrt(vec.reduce((s,v)=>s+v*v,0)) || 1
    return vec.map(v=>v/norm)
}

function visualizeText(text){
    const ctx = vizCanvas.getContext('2d')
    ctx.clearRect(0,0,vizCanvas.width,vizCanvas.height)
    if(!text) return
    const tokens = Array.from(new Set((text.toLowerCase().match(/[a-z\d']+/g) || [])))
    if(tokens.length===0) return
    const dim = 8
    const w = vizCanvas.width, h=vizCanvas.height
    // random projection weights fixed
    const rw = Array.from({length:dim},()=>Math.random()*2-1)
    const rw2 = Array.from({length:dim},()=>Math.random()*2-1)
    const points = tokens.map(t=>{
        const v = hashVector(t,dim)
        const x = v.reduce((s,vi,idx)=>s+vi*rw[idx],0)
        const y = v.reduce((s,vi,idx)=>s+vi*rw2[idx],0)
        return {t,x,y}
    })
    const xs = points.map(p=>p.x); const ys = points.map(p=>p.y)
    const minx = Math.min(...xs), maxx=Math.max(...xs)
    const miny = Math.min(...ys), maxy=Math.max(...ys)
    const pad = 40
    points.forEach(pt=>{
        const nx = pad + ((pt.x - minx) / (maxx - minx || 1)) * (w - pad*2)
        const ny = pad + ((pt.y - miny) / (maxy - miny || 1)) * (h - pad*2)
        ctx.beginPath(); ctx.fillStyle = '#7c4dff'; ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1
        ctx.arc(nx,ny,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle='rgba(230,238,248,0.95)'; ctx.font='12px Inter,Arial'; ctx.fillText(pt.t, nx+10, ny+4)
    })
}

analyzeBtn?.addEventListener('click', ()=>{
    const text = textInput.value.trim()
    const res = analyzeText(text)
    renderAnalysis(res)
})

visualizeBtn?.addEventListener('click', ()=>{
    const text = textInput.value.trim()
    visualizeText(text)
})

clearBtn?.addEventListener('click', ()=>{
    textInput.value=''
    analysisDiv.innerHTML=''
    const ctx = vizCanvas.getContext('2d'); ctx.clearRect(0,0,vizCanvas.width,vizCanvas.height)
})

// Friendly small helper: autofocus textarea on small screens
if(textInput) textInput.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.key==='Enter'){ analyzeBtn.click() } })

// initial message
document.addEventListener('DOMContentLoaded', ()=>{
    analysisDiv.innerHTML = '<p class="muted">Try the playground: paste a paragraph, click <strong>Analyze</strong> or <strong>Visualize Vectors</strong>.</p>'
})