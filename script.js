let menusToDelete = {};

// fetches the data needed for the current site
document.addEventListener('DOMContentLoaded', function() {
  switch(window.location.pathname) {
    case '/taskbar':
      fetch('/menus/taskbar')
      .then(res => res.json())
      .then(data => {
        const root = document.createElement('div')
        root.className = 'context-menu';

        data.forEach(element => {
          if (element['menu']) {
            const currentMenu = element['menu'];
            //check if it is expanded
            if (currentMenu.expanded) {
              root.append(getChildren(currentMenu.children));
            } else {
              console.log('found folder:');
              const parent = document.createElement('div');
              parent.className = 'element';
              const child = document.createElement('div');
              child.className = 'menu';
              child.innerText = currentMenu.title;
              parent.appendChild(child);
              root.appendChild(parent);
            }
          }
        })
        document.querySelector('#main').appendChild(root);
      })
      break;
    
  }
  console.log('finsihed');
})


function getChildren(array, depth = 0) {
  const fragment = document.createDocumentFragment();

  //loop over every element
  array.forEach(element => {
    const div = document.createElement('div');
    div.className = 'element';

    const child = document.createElement('div');

    //check if it is an item or a menu
    var type = '';
    if (element['item']) type = 'item';
    else if (element['menu']) type = 'menu';

    child.className = type;
    child.innerText = element[type].title;

    //menu only
    if (element['menu']) {
      //preping for nested menus
      const newMenu = generateContextMenuDiv(element['menu'].children, depth + 1);
      div.onclick = (event) => {
        const offset = calculateElementsOffset(event.target);
        removeContextMenus(depth);
        appendContextMenu(newMenu, depth, offset);
      }
    }
    //seperator logic
    if (element[type].sep) {
      const sep = document.createElement('hr');
      fragment.appendChild(sep);
    }
    div.appendChild(child);
    fragment.appendChild(div);
    console.log(element);
  })
  return fragment;
}

function generateContextMenuDiv(array, depth = 0) { 
  const container = document.createElement('div')
  container.className = 'context-menu';

  //logic for the hover-create-div
  const hoverDiv = document.createElement('div');
  hoverDiv.className = 'hover-div';
  // hoverDiv.textContent = '+';

  const items = getChildren(array, depth);
  let itemsYList = [];
  let itemsList = []; //list of all divs - excluding hr

  container.onmouseenter = (event) => {
    //preping variables to reduce calculations
    hoverDiv.style.display = 'block';

    //calculate center coordinates of all children divs
    itemsYList = [];
    itemsList = [];
    Array.from(container.children).forEach((item) => {
      if (item.tagName === 'HR') return;
      itemsList.push(item);

      const rect = item.getBoundingClientRect();
      const itemMiddle = rect.top - container.getBoundingClientRect().top + rect.height / 2;
      itemsYList.push(itemMiddle);
    });
  }
  container.onmousemove = (event) => {
    if (event.target === event.currentTarget) return;
    const mouseY = event.clientY + window.scrollY - container.getBoundingClientRect().top - window.scrollY;
    
    //calculate the closest div to insert the hoverDiv
    let low = 0;
    let high = itemsYList.length - 1;
    while (low <= high) {
      let mid = Math.floor((low + high) / 2);

      if (itemsYList[mid] === mouseY) {
        return mid; // Number already exists in the array
      } else if (itemsYList[mid] < mouseY) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const bestIndex = low;

    console.log(bestIndex);
    //hoverDiv's onclick logic
    //calculate the respective index from the file
    const index = array[bestIndex]?.index ?? array[bestIndex - 1].index + 1;
    hoverDiv.onclick = () => {
      console.log('clicked on index:', index);
    }
    hoverDiv.setAttribute('data-bs-toggle', 'modal');
    hoverDiv.setAttribute('data-bs-target', '#staticBackdrop');
    hoverDiv.setAttribute('data-bs-index', index);

    //append it to the best index
    if (itemsList[bestIndex]) itemsList[bestIndex].parentNode.insertBefore(hoverDiv, itemsList[bestIndex]);
    else container.appendChild(hoverDiv);
  }

  // Hide the hoverDiv when the mouse leaves the container
  container.addEventListener('mouseleave', function() {
    hoverDiv.style.display = 'none';
  });

  container.append(items);
  return container;
}

function appendContextMenu(menu, depth, offset) {
  menu.style.top = offset + 'px';
  document.querySelector('#main').appendChild(menu);
  menusToDelete[depth] = menu;
}

function removeContextMenus(depth) {
  while (true) {
    if (menusToDelete[depth]) {
      menusToDelete[depth].remove();
      delete menusToDelete[depth];
      depth++;
    } else {
      break;
    }
  }
}
function calculateElementsOffset(element) {
  //go to div of class element
  var div = element;
  if (div.className !== 'element') div = div.parentElement;

  const rawOffset = div.offsetTop;
  //in case of margin
  const containerOffset = div.parentElement.offsetTop;

  const offset = rawOffset + containerOffset - 5; //5 is hardcoded
  return offset;
}
document.body.onclick = () => {
  if (event.target === document.body) removeContextMenus(0);
  //okay so every onclick event will trigger this function btw, because of propagation
}
document.querySelector('#main').onclick = (event) => {
  if (event.target === document.querySelector('#main')) removeContextMenus(0);
  //same here 😔
}