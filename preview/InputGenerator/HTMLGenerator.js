const nameContent = `
<span class="param-type">InputGroup</span>
<span class="param-value"><input type="text" value="input_group_0"></span>`;

const anchorContent = `
<span class="param-type">anchor ID</span>
<span class="param-value"><input type="number" step="1" value="0"></span>`;

const detectWindowContent = `
<span class="param-type">anchor detection window</span>
<span class="param-value"><input type="number" step="1" value="250"></span>
<span class="param-unit">ms</span>`;

{/* <li class="parameter input-group param-name input-group-name">
    <span class="param-type">InputGroup</span>
    <span class="param-value"><input type="text" value="input_group_0"></span>
</li>
<li class="parameter input-group param-anchor">
    <span class="param-type">anchor ID</span>
    <span class="param-value"><input type="number" step="1" value="0"></span>
</li>
<li class="parameter input-group param-anchor-dw">
    <span class="param-type">anchor detection window</span>
    <span class="param-value"><input type="number" step="1" value="250"></span>
    <span class="param-unit">ms</span>
</li> */}

function createNewInputGroup() {
  const newGroup = document.createElement('ul');
  newGroup.classList.add('input-group-list');

  const name = document.createElement('li');
  name.classList.add('parameter', 'input-group', 'param-name', 'input-group-name');
  name.innerHTML = nameContent;

  const anchor = document.createElement('li');
  anchor.classList.add('parameter', 'input-group', 'param-anchor');
  anchor.innerHTML = anchorContent;

  const detectWindow = document.createElement('li');
  detectWindow.classList.add('parameter', 'input-group', 'param-anchor-dw');
  detectWindow.innerHTML = detectWindowContent;

  newGroup.appendChild(name);
  newGroup.appendChild(anchor);
  newGroup.appendChild(detectWindow);

  anchor.querySelector('.param-value').addEventListener('click', e => {
    isSelectMode = true;
    selectTarget = e.target;
  });

  return newGroup;
}