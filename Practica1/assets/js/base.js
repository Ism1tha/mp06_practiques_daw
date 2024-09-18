/* MP06 - Activitat 1 */

var exArray = [];

function submitForm() {

    /* Obtenim els elements del DOM */
    var inputElement = document.getElementById("input");
    var errorMsgElement = document.getElementById("error-msg");

    /* Validem el camp de text */
    var regex = /^[a-zA-Z]+$/;
    if (!inputElement.value.match(regex) || inputElement.value.length == 0) {
        errorMsgElement.innerHTML = "El valor introduït no és vàlid.";
        errorMsgElement.style.display = "block";
        if(!inputElement.classList.contains("error")) {
            inputElement.classList.add("error");
        }
        return;
    }

    /* No hi ha errors, verifiquem classe error i afegim a l'array */
    errorMsgElement.style.display = "none";
    if(inputElement.classList.contains("error")) {
        inputElement.classList.remove("error");
    }

    exArray.push(inputElement.value);

    /* Esborrem el valor del camp de text */
    inputElement.value = "";

    /* Actualitzem la llista */
    updateResults2();
}

function updateResults() {

    /* Obtenim els elements del DOM */
    var resultTotalElement = document.getElementById("resultTotal");
    var resultListElement = document.getElementById("resultList");

    /* Preparem la variable on anirem afegint els elements de la llista (HTML) */
    var listHTML = "";

    /* Recorrem l'array i afegim els elements a la llista */
    exArray.forEach((element, index) => {
        listHTML += "<li>" + element + " <button onclick='deleteElement(" + index + ")'>Eliminar</button></li>";
    });

    /* Afegim la llista al DOM I actualitzem el total */
    resultListElement.innerHTML = listHTML;
    resultTotalElement.innerHTML = exArray.length;
}

function updateResults2() {

    /* Obtenim els elements del DOM */
    var resultTotalElement = document.getElementById("resultTotal");
    var resultListElement = document.getElementById("resultList");

    /* Eliminem tots els elements de la llista de forma elegant */
    while (resultListElement.firstChild) {
        resultListElement.removeChild(resultListElement.firstChild);
    }

    /* Recorrem l'array i afegim els elements a la llista */
    exArray.forEach((element, index) => {
        
        /* Primer creem el element del botó */
        let btnElement = document.createElement("button");
        btnElement.onclick = () => deleteElement(index);
        btnElement.textContent = "Eliminar";

        /* Creem el element de la llista */
        let liElement = document.createElement("li");
        liElement.textContent = element + " ";
        liElement.appendChild(btnElement);

        /* Afegim el element a la llista */
        resultListElement.appendChild(liElement);

    });

    /* Actualitzem el total */
    resultTotalElement.innerHTML = exArray.length;
}

/* Eliminar element del array */
function deleteElement(index) {
    exArray.splice(index, 1);
    updateResults2();
}