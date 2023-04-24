
export function initialize() {
    const canvas = document.getElementById('myCanvas');



    let ctx;
    
    if (canvas){
        ctx = canvas.getContext('2d');
    }
    const customDialog = document.getElementById('custom-dialog');
    const customInput = document.getElementById('custom-input');
    const customAccept = document.getElementById('custom-accept');
    const customCancel = document.getElementById('custom-cancel');
    
    
    let currentItemCopy;
    
    let isDragging = false;
    let currentItem;
    let offsetX = 0;
    let offsetY = 0;
    let isResizing = false;
    let resizeHandleSize = 8;
    let lastElement;
    let clickedItem = null; // the item that was clicked for the context menu
    let newItem;
    let currentImage;
    let itemid = 0;
    let isEditing = false;
    let copiedItem = null;
    let itemsCanvas = [];
    let contextMenuActive = false;
    let oldHeight;
    let contextMenu = document.querySelector(".menu");
    
    const resetCanvas = () => {
        itemsCanvas = []
        drawItems()
    }
    
    const undoCanvas = () => {
        console.log("undo")
        console.log(lastElement)
        lastElement = itemsCanvas.pop();
        console.log(lastElement)
        drawItems()
    }
    
    const forwardCanvas = () => {
        itemsCanvas.push(lastElement)
        drawItems()
    }
    
    const drawItems = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        itemsCanvas.forEach((item) => {
            if (item.type === 'image') {
                if (item.carousal) {
    
                    ctx.drawImage(item.element, item.x + item.width / 2, item.y + item.height / 8, item.width, item.height * 0.75);
                    ctx.drawImage(item.element, item.x - item.width / 2, item.y + item.height / 8, item.width, item.height * 0.75);
                    ctx.drawImage(item.element, item.x, item.y, item.width, item.height);
    
                } else {
    
                    ctx.drawImage(item.element, item.x, item.y, item.width, item.height);
    
                    if (isResizing) {
                        const handleSize = resizeHandleSize;
                        const handleX = item.x + item.width - handleSize;
                        const handleY = item.y + item.height - handleSize;
                        ctx.fillStyle = '#000';
                        ctx.fillRect(handleX, handleY, handleSize, handleSize);
                        ctx.fillStyle = '#fff';
                    }
    
                }
    
    
            } else {
    
                if (item.x + item.width > 0 && item.y + item.height > 0 && item.x < canvas.width && item.y < canvas.height) {
    
    
                    if (item.banner) {
                    
                        ctx.font = 'bold 36px Arial';
                
                        ctx.fillStyle = "white";
                        ctx.fillText(item.text, item.x, item.y + 30);
    
                    } else {
                        
                        ctx.font = 'bold 12px Arial';
                        ctx.fillStyle = "white";

    
                        const maxWidth = item.maxWidth; // get width from the user selected width
                        let words = item.text.split(' ');
                        let line = '';
                        let lines = [];
    
                        for (let i = 0; i < words.length; i++) {
                            let testLine = line + words[i] + ' ';
                            let testWidth = ctx.measureText(testLine).width;
    
                            if (testWidth > maxWidth) {
                                lines.push(line);
                                line = words[i] + ' ';
                            } else {
                                line = testLine;
                            }
                        }
    
                        lines.push(line);
    
                        const textHeight = 14; // line-height of 0.4
                        const totalHeight = lines.length * textHeight;
    
    
                        // ctx.fillStyle = "gray";
                        // ctx.shadowOffsetX = 2;
                        // ctx.shadowOffsetY = 2;
                        // ctx.shadowBlur = 2;
                        // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                        // ctx.fillRect(item.x - 15, item.y - 10, maxWidth + 30, totalHeight + 20);
                        ctx.fillStyle = "white";
                        //
    
                        // ctx.shadowOffsetX = 1;
                        // ctx.shadowOffsetY = 1;
                        // ctx.shadowBlur = 1;
                        // ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    
                        for (let i = 0; i < lines.length; i++) {
                            ctx.fillText(lines[i], item.x + 5, item.y - 3 + (i + 1) * textHeight);
                        }
                    }
    
    
                }
            }
        });
    };
    
    const onMouseDown = (event) => {
    
        if (!contextMenuActive) {
            if (event.button === 2) { // if right-clicked
                const currentX = event.clientX - canvas.offsetLeft;
                const currentY = event.clientY - canvas.offsetTop;
    
                // checks if the mouse click event occurs within the boundaries of an item on the canvas.
                for (let i = 0; i < itemsCanvas.length; i++) {
                    const item = itemsCanvas[i];
                    if (currentX > item.x && currentX < item.x + item.width && currentY > item.y && currentY < item.y + item.height) {
                        currentItem = item;
                        break;
                    }
                }
                return;
            }
    
            isDragging = true;
            const currentX = event.clientX - canvas.offsetLeft;
            const currentY = event.clientY - canvas.offsetTop;
    
            // checks if the mouse click event occurs within the boundaries of an item on the canvas.
            for (let i = 0; i < itemsCanvas.length; i++) {
                const item = itemsCanvas[i];
                if (currentX > item.x && currentX < item.x + item.width && currentY > item.y && currentY < item.y + item.height) {
                    if (currentX > item.x + item.width - resizeHandleSize && currentY > item.y + item.height - resizeHandleSize) {
                        isResizing = true;
                        currentItem = item;
                        startX = currentX;
                        startY = currentY;
                    } else {
                        offsetX = currentX - item.x;
                        offsetY = currentY - item.y;
                        currentItem = item;
                    }
                    break;
                }
            }
    
        }
        contextMenuActive = false;
    };
    
    
    function pasteCanvas() {
    
        if (copiedItem) {
            newItem = Object.assign({}, copiedItem); // create a copy of the copied item
            itemsCanvas.push(newItem);
            // copiedItem = null;
            drawItems();
        }
        contextMenu.style.display = "none";
    }
    
    
    function copyCanvas(event) {
        // check if an item was clicked on the canvas
        if (currentItemCopy) {
            if (currentItemCopy.type === 'text') {
                copiedItem = {
                    x: currentItemCopy.x + 50,
                    y: currentItemCopy.y + 50,
                    width: currentItemCopy.width,
                    height: currentItemCopy.height,
                    text: currentItemCopy.text,
                    banner: currentItemCopy.banner,
                    type: currentItemCopy.type,
                    maxWidth: currentItemCopy.maxWidth,
                    color: currentItemCopy.color
                };
            } else if (currentItemCopy.type === 'image') {
                copiedItem = {
                    type: 'image',
                    element: currentItemCopy.element,
                    x: currentItemCopy.x + 20,
                    y: currentItemCopy.y + 20,
                    width: currentItemCopy.width,
                    type: currentItemCopy.type,
                    height: currentItemCopy.height,
                    url: currentItemCopy.url
                };
            }
    
        }
        newItem = Object.assign({}, copiedItem);
        currentItemCopy = null;
        contextMenu.style.display = "none";
    
    }
    
    
    function editCanvas() {
    
    
        isEditing = true;
        contextMenu.style.display = "none";
        customInput.select();
        if (currentItemCopy && currentItemCopy.type === 'text') {
            showCustomDialog((newText) => {
                if (newText) {
                    currentItemCopy.text = newText;
                    drawItems();
                    contextMenu.style.display = "none";
                    isEditing = false;
                }
            }, currentItemCopy.text);
    
        }
    }
    
    
    const onMouseMove = (event) => {
    
        if (isDragging) {
            if (isResizing) {
                let deltaX = 0;
                let deltaY = 0;
                if (event.clientX < startX || event.clientY < startY) {
                    deltaX -= 2;
                    deltaY -= 2;
                } else {
                    deltaX += 2;
                    deltaY += 2;
                }
                currentItem.width += deltaX;
                currentItem.height += deltaY;
                startX = event.clientX;
                startY = event.clientY;
    
            } else {
                currentItem.x = event.clientX - canvas.offsetLeft - offsetX;
                currentItem.y = event.clientY - canvas.offsetTop - offsetY;
            }
            drawItems();
        }
    }
    
    const onMouseUp = (event) => {
        isDragging = false;
        isResizing = false;
        currentItemCopy = currentItem;
    
        currentItem = null;
        drawItems();
    }
    
    
    const onSaveBtnClick = () => {
        const itemPositions = itemsCanvas.map(item => ({
            x: item.x,
            y: item.y,
            text: item.text,
            imageW: item.width,
            imageH: item.height,
            url: item.url,
            carousal: item.carousal
        }));
    
        localStorage.setItem('itemPositions', JSON.stringify(itemPositions));
    
        const header = document.querySelector('meta[name="_csrf_header"]').content;
        const token = document.querySelector('meta[name="_csrf"]').content;
    
        let title = prompt("Please enter a title:");
        fetch('/api/addPage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [header]: token
            },
            body: JSON.stringify({
                itemPositions: itemPositions,
                title: title
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Response not OK');
            }
            return response.json();
        })
            .then(data => {
                window.location.href = `/page/template?id=${data}`;
            })
            .catch(error => {
                console.error('There was a problem adding the page:', error);
            });
    }
    
    // add a text
    const addItem = () => {
    
        showCustomDialog((newText) => {
            if (newText !== '') {
                const newItem = {
                    x: Math.floor(Math.random() * 300 + 100),
                    y: Math.floor(Math.random() * 300 + 100),
                    width: (ctx.measureText(newText).width + 20),
                    height: 50,
                    text: newText,
                    type: 'text',
                    banner: false,
                    maxWidth: 200,
                    color: "white"
                };
    
                itemsCanvas.push(newItem);
    
    
            }
            drawItems();
    
        }, '');
    
    
    }
    
    
    const addCarousaltoCanvas = () => {
        //clear editor
        if (currentImage != null) {
            const editor = document.getElementById('editor');
            editor.classList.remove('success');
            const container = document.querySelector('.image-grid');
            container.innerHTML = '';
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '';
    
            let file = currentImage;
            const img = new Image();
    
            img.onload = () => {
                let maxWidth = 350;
                let maxHeight = 500;
                let width = img.width;
                let height = img.height;
                let resizeRatio = 1;
    
                //resize
                if (width > maxWidth || height > maxHeight) {
                    if (width / maxWidth > height / maxHeight) {
                        resizeRatio = maxWidth / width;
                    } else {
                        resizeRatio = maxHeight / height;
                    }
                    width *= resizeRatio;
                    height *= resizeRatio;
                }
    
                // temporary canvas to resize and not affect old canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
    
                // create a new image object from the canvas
                const resizedImg = new Image();
                resizedImg.onload = () => {
                    itemsCanvas.push({
                        type: 'image',
                        element: resizedImg,
                        x: 0,
                        y: 0,
                        carousal: true,
                        width: resizedImg.width,
                        height: resizedImg.height,
                        url: file['urls']['thumb']
                    });
    
                    drawItems();
    
                    URL.revokeObjectURL(resizedImg.src);
                };
                resizedImg.src = file['urls']['thumb']
    
            };
    
    
            img.src = file['urls']['thumb']
            currentImage = null;
    
        } else {
            alert("Select a Image");
        }
    
    }
    
    
    const addBannerToCanvas = () => {
        let userInput = prompt("Please enter some text:");
        if (userInput === null || userInput === "") {
            return;
        }
        const newItem = {
            itemId: itemid++,
            x: Math.floor(Math.random() * 300 + 100),
            y: Math.floor(Math.random() * 300 + 100),
            width: (ctx.measureText(userInput).width + 20),
            height: 50,
            text: userInput,
            banner: true,
            color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
        };
    
        itemsCanvas.push(newItem);
        drawItems();
    
    }
    
    
    const addImage = () => {
        //clear editor
        if (currentImage != null) {
    
            console.log(oldHeight)
            document.getElementById('editor').style.height = oldHeight;
            const editor = document.getElementById('editor');
            editor.classList.remove('success');
            const container = document.querySelector('.image-grid');
            container.innerHTML = '';
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '';
    
            let file = currentImage;
            const img = new Image();
    
            img.onload = () => {
                let maxWidth = 350;
                let maxHeight = 500;
                let width = img.width;
                let height = img.height;
                let resizeRatio = 1;
    
                //resize
                if (width > maxWidth || height > maxHeight) {
                    if (width / maxWidth > height / maxHeight) {
                        resizeRatio = maxWidth / width;
                    } else {
                        resizeRatio = maxHeight / height;
                    }
                    width *= resizeRatio;
                    height *= resizeRatio;
                }
    
                // temporary canvas to resize and not affect old canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
    
                // create a new image object from the canvas
                const resizedImg = new Image();
                resizedImg.onload = () => {
                    itemsCanvas.push({
                        type: 'image',
                        element: resizedImg,
                        x: 0,
                        y: 0,
                        width: resizedImg.width,
                        height: resizedImg.height,
                        url: file['urls']['thumb']
                    });
    
                    drawItems();
    
                    URL.revokeObjectURL(resizedImg.src);
                };
                resizedImg.src = file['urls']['thumb']
    
            };
    
    
            img.src = file['urls']['thumb']
            currentImage = null;
    
        } else {
            alert("Select a Image");
        }
    
    }

    
    
    const SearchImage = () => {
    
        const searchInput = document.getElementById('searchInput');
        const API_URL = 'https://api.unsplash.com/'
        const ACCESS_KEY = 'NaHFk6fEWYCWjF10KF4L9EiplttQNKmTUu6rcLJ9uLc'
        let searchValue = searchInput.value;
    
        fetch(`${API_URL}search/photos?page=1&query=${searchValue}&client_id=${ACCESS_KEY}`)
            .then(response => response.json())
            .then(data => {
                this.images = data.results;
                return (data.results);
            })
            .then(handleImages)
            .catch(error => {
                console.error('Error fetching images:', error);
    
            });
    
    }
    
    function changeHtmlButton(activeStatus) {
        const button = document.getElementById("html")
        if (activeStatus === "active") {
            button.style.backgroundColor = "rgb(68, 68, 68)";
            button.style.color = "white"
        } else {
            button.style.backgroundColor = "white"
            button.style.color = "black"
        }
    }
    
    
    function showCustomDialog(callback, defaultText = '') {
        customDialog.style.display = 'block';
        customInput.value = defaultText
        customInput.focus();
    
        const AcceptWithEnter = (event) => {
            if (event.key === 'Enter') {
                const newText = customInput.value.trim();
                callback(newText);
                customDialog.style.display = 'none';
                customInput.removeEventListener('keydown', AcceptWithEnter);
            }
        };
    
        customInput.addEventListener('keydown', AcceptWithEnter);
    
        function handleAccept() {
            const newText = customInput.value.trim();
            callback(newText);
            customDialog.style.display = 'none';
            customAccept.removeEventListener('click', handleAccept);
            customCancel.removeEventListener('click', handleCancel);
        }
    
        function handleCancel() {
            customDialog.style.display = 'none';
            customAccept.removeEventListener('click', handleAccept);
            customCancel.removeEventListener('click', handleCancel);
        }
    
        customAccept.addEventListener('click', handleAccept);
        customCancel.addEventListener('click', handleCancel);
    }
    
    
    function hideCustomDialog() {
        customDialog.style.display = 'none';
    }
    
    
    function closeModal() {
        const container = document.getElementById("editor")
        changeHtmlButton("active")
        container.style.display = "none";
    }
    
    function openModal() {
        const div = document.getElementById("editor")
        if (div.style.display === "none") {
            div.style.display = "";
            changeHtmlButton("unActive")
        } else {
            changeHtmlButton("active")
            closeModal();
        }
    }
    
    function handleImages(images) {
        oldHeight = document.getElementById('editor').style.height;
        document.getElementById('editor').style.height = '1000px';
        const container = document.querySelector('.image-grid');
        container.innerHTML = '';
        for (let j = 0; j < images.length; j++) {
            //todo remove box or not so
            // const box = document.createElement('div');
            // box.classList.add('box');
            const img = document.createElement('img');
            img.src = images[j]['urls']['thumb']
            img.id = (j + 1).toString()
    
    
            img.addEventListener("click", function () {
                // Add a CSS class to the image element that adds the border
                const allImages = container.querySelectorAll("img");
                for (let i = 0; i < allImages.length; i++) {
                    if (allImages[i] !== img) {
                        allImages[i].style.border = null
                    }
                }
    
                img.style.border = "2px solid black"
                currentImage = images[j];
            });
            // box.appendChild(img);
            container.appendChild(img)
    
        }
    
    }
    
    //
    // function editCanvas(event) {
    //     console.log(123)
    //     // get the canvas bounds
    //     const canvasBounds = canvas.getBoundingClientRect();
    //     // calculate the mouse position relative to the canvas
    //     const mouseX = event.clientX - canvasBounds.left;
    //     const mouseY = event.clientY - canvasBounds.top;
    //
    //     console.log(mouseX)
    //     console.log(mouseY)
    //
    //     // iterate over the canvas items and check if the mouse click is within bounds of any text items
    //     itemsCanvas.forEach(item => {
    //         console.log(item)
    //         if (item.type === 'text' && mouseX >= item.x && mouseX <= item.x + item.width
    //             && mouseY >= item.y && mouseY <= item.y + item.height) {
    //             // show prompt to edit text
    //             const newText = prompt('Enter new text:', item.text);
    //             if (newText) {
    //                 item.text = newText;
    //                 console.log(`Updated text for item ${item.id}: ${item.text}`);
    //                 drawItems();
    //             }
    //         }
    //     });
    // }
    
    
    const Init = () => {
    
        if (document.getElementById('editor')) {
            const editorContainer = new Editor("editor");
            document.body.appendChild(editorContainer.getContainer());
        }
    
        if (document.getElementById('contextMenu')){
            const contextMenuContainer = new ContextMenu("contextMenu");
                document.body.appendChild(contextMenuContainer.getContainer());
    
        }
    
    
    
        if (canvas){
            canvas.addEventListener('mousedown', onMouseDown);
            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mouseup', onMouseUp);
    
        }
    
    
    
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', onSaveBtnClick);
        }
    
        const undoButton = document.getElementById('undoBtn')
        if (undoButton){
            undoButton.addEventListener('click', undoCanvas);
    
        }
    
        const forwardButton = document.getElementById('forwardBtn')
        forwardButton.addEventListener('click', forwardCanvas);
    
    
        const resetButton = document.getElementById("resetButton")
        if (resetButton) {
            resetButton.addEventListener("click", resetCanvas)
        }
    
    
        const searchButton = document.getElementById("searchButton")
        if (searchButton){
            searchButton.addEventListener('click', SearchImage);
        }
    
    
        const addButton = document.getElementById("AddImage")
        if (addButton){
            addButton.addEventListener('click', addImage)
        }
    
    
    
        const addBanner = document.getElementById("addBanner")
        if (addBanner){
            addBanner.addEventListener('click', addBannerToCanvas)
        }
    
        const html = document.getElementById("html")
        if (html){
            html.addEventListener('click', openModal)
        }
    
    
    
        const closeButton = document.getElementById("closeButton")
        if (closeButton){
            closeButton.addEventListener('click', closeModal)
        }
    
        const editor = document.getElementById("editor");
        if (editor){
            let offsetXX, offsetYY;
    
            editor.addEventListener("dragstart", function (e) {
                offsetXX = e.clientX - editor.offsetLeft;
                offsetYY = e.clientY - editor.offsetTop;
                editor.style.opacity = "0.8";
            });
    
            editor.addEventListener("drag", function (e) {
                editor.style.left = e.clientX - offsetXX + "px";
                editor.style.top = e.clientY - offsetYY + "px";
    
    
            });
    
            editor.addEventListener("dragend", function (e) {
                editor.style.opacity = "1";
                // Save the new position of the editor
            });
    
        }
    
    
    
    
        const addBtn = document.getElementById('addBtn');
        if (addBtn){
            addBtn.addEventListener('click', addItem);
        }
    
    
        const addCarousal = document.getElementById('addCarousal');
        if (addCarousal){
            addCarousal.addEventListener('click', addCarousaltoCanvas);
        }
    
    
        contextMenu = document.getElementById('contextMenu');
        if (contextMenu){
    
            contextMenu.style.display = "none";
            document.addEventListener("contextmenu", function (event) {
    
                contextMenuActive = true
                event.preventDefault();
                contextMenu.style.display = "block";
                contextMenu.style.position = "fixed";
                contextMenu.style.top = event.clientY + "px";
                contextMenu.style.left = event.clientX + "px";
    
    
                if (!newItem) {
                    pasteBtn.style.pointerEvents = "none";
                    pasteBtn.style.opacity = "0.5";
                } else {
                    pasteBtn.style.pointerEvents = "auto";
                    pasteBtn.style.opacity = "1";
                }
    
                if (itemsCanvas.length === 0 || !lastElement) {
                    undoBtn.style.pointerEvents = "none";
                    undoBtn.style.opacity = "0.5";
    
                } else {
                    undoBtn.style.pointerEvents = "auto";
                    undoBtn.style.opacity = "1";
                }
    
    
                if (!currentItem) {
                    editBtn.style.pointerEvents = "none";
                    editBtn.style.opacity = "0.5";
    
                    deleteBtn.style.pointerEvents = "none";
                    deleteBtn.style.opacity = "0.5";
    
                    copyBtn.style.pointerEvents = "none";
                    copyBtn.style.opacity = "0.5";
    
                } else {
                    editBtn.style.pointerEvents = "auto";
                    editBtn.style.opacity = "1";
    
                    deleteBtn.style.pointerEvents = "auto";
                    deleteBtn.style.opacity = "1";
    
                    copyBtn.style.pointerEvents = "auto";
                    copyBtn.style.opacity = "1";
    
                }
    
            });
    
            // hide when clicked outside
            document.addEventListener("click", function (event) {
                if (!contextMenu.contains(event.target)) {
                    contextMenu.style.display = "none";
                }
            });
    
    
    
    
    
            // hide when click esc
            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    contextMenu.style.display = "none";
                }
            });
    
        }
    
    
    
    
    
    
        const deleteBtn = document.getElementById("delete-btn");
    
        if (deleteBtn){
    
            function deleteCurrentItem() {
                if (currentItemCopy) {
                    const indexToRemove = itemsCanvas.findIndex(item => item.x === currentItemCopy.x);
                    //returns -1 if nothing was found with that X pos
                    if (indexToRemove !== -1) {
                        itemsCanvas.splice(indexToRemove, 1);
                        currentItemCopy = null;
                    }
                    contextMenu.style.display = "none";
                    drawItems()
                }
            }
    
            deleteBtn.addEventListener("click", deleteCurrentItem);
    
    
    
        }
    
    
    
    
        const undoBtn = document.getElementById("undo-btn");
        if (undoBtn){
            undoBtn.addEventListener("click", function () {
                undoCanvas()
                contextMenu.style.display = "none";
    
            });
        }
    
    
    
        const editBtn = document.getElementById("edit-btn");
        if (editBtn){
            editBtn.addEventListener('click', editCanvas);
        }
    
    
        const copyBtn = document.getElementById("copy-btn");
        if (copyBtn){
            copyBtn.addEventListener('click', copyCanvas);
        }
    
    
        if ( document.getElementById('contextMenu')){
            document.addEventListener('keydown', (event) => {
                if (event.metaKey && event.key === 'c') { // metaKey is the Command key on Mac
                    event.preventDefault(); // prevent default copy behavior
                    copyCanvas();
                }
                if (event.metaKey && event.key === 'v') { // metaKey is the Command key on Mac
                    event.preventDefault();
                    pasteCanvas();
                }
                if (event.metaKey && event.key === 'x') { // metaKey is the Command key on Mac
                    event.preventDefault();
                    deleteCurrentItem()
                }
                if (event.metaKey && event.key === 'z') { // metaKey is the Command key on Mac
                    event.preventDefault();
                    undoCanvas()
                }
                if (event.metaKey && event.key === 'e') { // metaKey is the Command key on Mac
                    event.preventDefault();
                    editCanvas()
                }
            });
        }
    
    
    
        const pasteBtn = document.getElementById("paste-btn");
        if (pasteBtn){
            pasteBtn.addEventListener('click', pasteCanvas);
        }
    
    
    
    }
    
    
    class ContextMenu {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.container.innerHTML = `
                <div>
                <div
            class = "menu" >
                <ul
            class = "menu-list" >
                <li
            class = "menu-item" >
                <button
            class = "menu-button"
            id = "undo-btn">
                <svg > </svg>
    
            <span>Undo </span>
            <span>CTRL+Z</span>
        </button>
        </li>
        </ul>
            <ul class="menu-list">
                <li class="menu-item">
                    <button class="menu-button" id="copy-btn">
                        <svg class="css-i6dzq1" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
                             stroke-linejoin="round"
                             stroke-width="2" viewBox="0 0 24 24" width="24">
                            <rect height="13" rx="2" ry="2" width="13" x="9" y="9"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
    
                        <span>Copy </span>
                        <span>CTRL+C</span>
                    </button>
                </li>
                <li class="menu-item">
                    <button class="menu-button" id="paste-btn">
                        <svg class="css-i6dzq1" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
                             stroke-linejoin="round"
                             stroke-width="2" viewBox="0 0 24 24" width="24">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect height="4" rx="1" ry="1" width="8" x="8" y="2"></rect>
                        </svg>
    
                        <span>Paste </span>
                        <span>CTRL+V</span>
                    </button>
                </li>
                <li class="menu-item">
                    <button class="menu-button" id="edit-btn">
                        <svg fill="none" height="24" id="IconChangeColor" stroke-width="1.5" viewBox="0 0 24 24"
                             width="24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11"
                                id="mainIconPathAttribute" stroke="currentColor" stroke-linecap="round"
                                stroke-linejoin="round"></path>
                            <path d="M8 10H16M8 6H12M8 14H11" id="mainIconPathAttribute" stroke="currentColor"
                                  stroke-linecap="round" stroke-linejoin="round"></path>
                            <path
                                d="M16 5.4V2.35355C16 2.15829 16.1583 2 16.3536 2C16.4473 2 16.5372 2.03725 16.6036 2.10355L19.8964 5.39645C19.9628 5.46275 20 5.55268 20 5.64645C20 5.84171 19.8417 6 19.6464 6H16.6C16.2686 6 16 5.73137 16 5.4Z"
                                fill="currentColor" id="mainIconPathAttribute" stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"></path>
                            <path
                                d="M17.9541 16.9394L18.9541 15.9394C19.392 15.5015 20.102 15.5015 20.5399 15.9394V15.9394C20.9778 16.3773 20.9778 17.0873 20.5399 17.5252L19.5399 18.5252M17.9541 16.9394L14.963 19.9305C14.8131 20.0804 14.7147 20.2741 14.6821 20.4835L14.4394 22.0399L15.9957 21.7973C16.2052 21.7646 16.3988 21.6662 16.5487 21.5163L19.5399 18.5252M17.9541 16.9394L19.5399 18.5252"
                                id="mainIconPathAttribute" stroke="currentColor" stroke-linecap="round"
                                stroke-linejoin="round"></path>
                        </svg>
    
                        <span>Edit </span>
                        <span>CTRL+E</span>
                    </button>
                </li>
                <li class="menu-item">
                    <button class="menu-button" id="delete-btn">
                        <svg class="css-i6dzq1" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
                             stroke-linejoin="round"
                             stroke-width="2" viewBox="0 0 24 24" width="24">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" x2="10" y1="11" y2="17"></line>
                            <line x1="14" x2="14" y1="11" y2="17"></line>
                        </svg>
    
                        <span>Delete </span>
                        <span>CTRL+X</span>
                    </button>
                </li>
            </ul>
            <ul class="menu-list">
                <li class="menu-item">
                    <button class="menu-button">
                        <svg></svg>
    
                        <span>Select All</span>
                        <span>CTRL+A</span>
                    </button>
                </li>
    
            </ul>
    
        </div>
        </div>
     `;
        }
    
        getContainer() {
            return this.container;
        }
    
    }
    
    
    class Editor {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.container.innerHTML = `
          <div class="editor-header">
            <button class="button" id="closeButton">X</button>
          </div>
          <div class="editor-content">
            <div class="editor-section top">
              <button class="button" id="addBanner">Add Banner</button>
            </div>
            <div class="editor-section left">
              <button class="button" id="addBtn">Add Text</button>
            </div>
            <div class="editor-section left">
              <button class="button" id="addCarousal">Create carousal</button>
            </div>
            <div class="editor-section right">
              <div>
                <form action="#" class="flex mb-8 m-auto max-w-md">
                  <input class="border border-gray-300 text-sm p-2 flex-grow mr-2 rounded shadow" id="searchInput" placeholder="Example : coffee, people, ..." type="text" />
                  <button class="inline-flex items-center" id="searchButton" type="submit">Search</button>
                </form>
                <button class="button" id="AddImage">Add image</button>
                <div class="image-grid"></div>
              </div>
            </div>
            <div class="editor-section bottom">
            </div>
          </div>
        `;
        }
    
        getContainer() {
            return this.container;
        }
    }
    
    
    Init();
    
    
    
    
    
    
    

}




const canvasEditTools = {
    initialize,
  };
  
  export default canvasEditTools;