async function init() {
  try {
    const response = await fetch('./smyl_classified.md');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const text = await response.text();
    window.calendarData = parseMarkdown(text);

    // Draw the UI
  const wheel = document.getElementById('month-wheel');
  const seasons = {
    Spring: { months: [1, 2, 3], color: '#48bb78' },
    Summer: { months: [4, 5, 6], color: '#ecc94b' },
    Autumn: { months: [7, 8, 9], color: '#c58633' },
    Winter: { months: [10, 11, 12], color: '#566c92' }
  };

  for (let i = 1; i <= 12; i++) {
    const season = Object.values(seasons).find(s => s.months.includes(i));
      wheel.appendChild(createWedge(i, season.color));
  }

    // Add About Button
    const aboutGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    aboutGroup.setAttribute("id", "about-button");
    aboutGroup.style.cursor = "pointer";

    const aboutCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    aboutCircle.setAttribute("cx", "250");
    aboutCircle.setAttribute("cy", "250");
    aboutCircle.setAttribute("r", "70");
    aboutCircle.setAttribute("fill", "#f0f2f5");

    const aboutText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    aboutText.setAttribute("x", "250");
    aboutText.setAttribute("y", "256");
    aboutText.setAttribute("text-anchor", "middle");
    aboutText.setAttribute("font-size", "18");
    aboutText.setAttribute("font-weight", "bold");
    aboutText.setAttribute("fill", "#2c3e50");
    aboutText.style.pointerEvents = "none";
    aboutText.textContent = "ABOUT";

    aboutGroup.appendChild(aboutCircle);
    aboutGroup.appendChild(aboutText);

    aboutGroup.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = "about.html";
    });

    wheel.appendChild(aboutGroup);
  renderMonth(1);
  } catch (error) {
    console.error('Initialization failed:', error);
}
}

function createWedge(month, color) {
  const angle = (month - 1) * 30;
  const startAngle = angle - 90;
  const endAngle = angle - 60;

  // Increased radius from 200 to 240
  const x1 = 250 + 240 * Math.cos(startAngle * Math.PI / 180);
  const y1 = 250 + 240 * Math.sin(startAngle * Math.PI / 180);
  const x2 = 250 + 240 * Math.cos(endAngle * Math.PI / 180);
  const y2 = 250 + 240 * Math.sin(endAngle * Math.PI / 180);

  const pathData = `M 250 250 L ${x1} ${y1} A 240 240 0 0 1 ${x2} ${y2} Z`;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "month-wedge");
  // Set transform-origin to the center of the SVG
  g.setAttribute("style", "transform-origin: 250px 250px; cursor: pointer;");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("fill", color);
  path.setAttribute("stroke", "white");
  path.setAttribute("style", "cursor: pointer;");

  // Interaction
  path.addEventListener('click', () => renderMonth(month));

  // Label - Increased radius and font size
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const textAngle = angle - 75;
  text.setAttribute("x", 250 + 180 * Math.cos(textAngle * Math.PI / 180));
  text.setAttribute("y", 250 + 180 * Math.sin(textAngle * Math.PI / 180));
  text.setAttribute("fill", "white");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "32"); // Increased from 20
  text.setAttribute("font-weight", "bold");
  text.textContent = month;

  g.appendChild(path);
  g.appendChild(text);
  return g;
}

function renderMonth(month) {
  const monthData = window.calendarData[month];
  if (!monthData) return;

  // Map of Category Names to HTML Element IDs
  const idMap = {
    "Rites and Sacrifices": "rites-sacrifices",
    "Social and Clan Life": "social-clan",
    "Agriculture and Labor": "agriculture-labor",
    "Commercial Activities": "commercial-activities",
    "Estate Defense": "estate-defense",
    "Health Measures": "health-measures"
  };

  // Clear existing content and populate cards
  Object.keys(idMap).forEach(category => {
    const card = document.getElementById(idMap[category]);
    const contentArea = card.querySelector('.content-area');
    contentArea.innerHTML = ''; // Clear

    const items = monthData[category] || [];
    if (items.length > 0) {
      const ul = document.createElement('ul');
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      contentArea.appendChild(ul);
    } else {
      contentArea.innerHTML = '<p style="color:#999; font-style:italic;">No recorded activities.</p>';
    }
  });
}

function parseMarkdown(md) {
  const data = {};
  const categories = [
    "Agriculture and Labor",
    "Rites and Sacrifices",
    "Social and Clan Life",
    "Health Measures",
    "Estate Defense",
    "Commercial Activities"
  ];

  // Split the file by Month headers
  const sections = md.split(/## Month (\d+)/);

  for (let i = 1; i < sections.length; i += 2) {
    const monthNum = parseInt(sections[i]);
    const monthText = sections[i + 1];
    
    // Initialize the month object with empty arrays for the 6 core categories
    data[monthNum] = {};
    categories.forEach(cat => data[monthNum][cat] = []);

    // Regex to find bullet points: * [Category] Content
    // It captures the tag inside [] and then all text until the next bullet or end of section
    const entryRegex = /\* \[(.*?)\] ([\s\S]*?)(?=\n\* |$)/g;
    let match;
    
    while ((match = entryRegex.exec(monthText)) !== null) {
      const categoryTag = match[1].trim();
      const content = match[2].trim();
      
      if (data[monthNum][categoryTag]) {
        data[monthNum][categoryTag].push(content);
      } else {
        // If a tag exists outside the 6 core ones, we still capture it
        data[monthNum][categoryTag] = [content];
      }
    }
  }
  return data;
}

init();

