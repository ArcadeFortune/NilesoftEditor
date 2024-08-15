document.addEventListener('DOMContentLoaded', function() {
  //modal onclick
  const modal = document.getElementById('staticBackdrop')
  modal?.addEventListener('show.bs.modal', event => {
    // Button that triggered the modal
    const button = event.relatedTarget
    // Extract info from data-bs-* attributes
    const index = button.getAttribute('data-bs-index')
    const hiddenInput = modal.querySelector('#index')
    hiddenInput.value = index
  })

  //image button onclick
  const imageButton = document.getElementById('imgbtn')
  imageButton?.addEventListener('click', event => {
    getFilePath(['#img', '#imgbtn'])
  })
})

function getFilePath(selectors){
  fetch('/selectFolder').then((res) => res.text()).then((filePath) => {
    selectors.forEach((selector) => {
      document.querySelector(selector).value = filePath;
      document.querySelector(selector).innerText = filePath;
    })
  });
}