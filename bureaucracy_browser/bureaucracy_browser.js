const selector = document.getElementById('fileSelector');

const visualizer = document.getElementById('viz'); // get the SVG

const emperor = {
    "id": "emperor",
    "parentId": null,
    "title_ch": "皇帝",
    "title_en": "Emperor",
    "title_py": "Huángdì",
    "rank": "Imperial",
    "personnel_count": {
      "base": 1,
      "notes": ""
    },
    "responsibilities": [],
    "historical_notes": "This direct association is not ultimately made in the Book of Later Han.  The library requires an ultimate parent node.  The exact chain of command between officials mapped here as directly subordinate to the Emperor is not directly described."
  }

function showSidebar(d) {
    console.log(d);
    const sidebar = document.getElementById('sidebar');
    const count = d.personnel_count;

    sidebar.innerHTML = `
        <h1>${d.title_ch}</h1>
        <h2>${d.title_en} (${d.title_py})</h2>
        <p><strong>Rank:</strong> ${d.rank || 'N/A'}</p>
        <p><strong>Personnel:</strong> ${count.base ?? 0} ${count.conditional ? `+ (Conditional: ${count.conditional})` : ''}</p>
        <h3>Responsibilities</h3>
        <ul>${d.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>
        <h3>Historical Notes</h3>
        <p>${d.historical_notes || 'No historical notes available.'}</p>
    `;
}

function renderGraph(data) {
    // Clear previous chart
    visualizer.innerHTML = '';

    new d3.OrgChart()
        .container('#viz')
        .data(data)
        .nodeId(d => d.id)
        .parentNodeId(d => d.parentId)
        .nodeWidth(d => 200)
        .nodeHeight(d => 100)
        .nodeContent((d, i, arr, state) => {
            return `
                <div style="padding:10px; background-color:#fdf6e3; border:1px solid #93a1a1;
                            border-radius:5px; height:100%; box-sizing:border-box; cursor:pointer;">
                    <div style="font-weight:bold; font-size:14px;">${d.data.title_ch}</div>
                    <div style="font-size:12px; color:#586e75;">${d.data.title_py}</div>
                    <div style="font-size:10px; color:#586e75;">${d.data.title_en}</div>
                    <div style="font-size:10px; margin-top:5px;">Rank: ${d.data.rank || 'unknown'}</div>
                </div>
            `;
        })
        .onNodeClick(d => {
            // d is the node object, d.data is your original JSON item
            showSidebar(d.data);
        })
        .render();
}

async function renderData(filename) {
    let filepath = `officialdom/${filename}`;
    try {
        const response = await fetch(filepath);
        const data = await response.json();
        data.push(emperor);
        renderGraph(data);
    } catch (err) {
        console.error("Failed to load officialdom data:", err);
    }
}



renderData(selector.value);

selector.addEventListener('change', (e)=>(renderData(e.target.value)));