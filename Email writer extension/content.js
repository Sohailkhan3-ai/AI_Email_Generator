console.log("Email writer Extension");

function getEmailContent(){

    
    const selectors =[
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];

    for(const selector of selectors){

        const content = document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
        
    }
    return '';

}

function createAIButton(){

    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role' , 'button')
    button.setAttribute('data-tooltip' , 'Generate AI Reply')

     button.style.marginRight = '8px';
    button.style.borderRadius = '18px';
    button.style.padding = '0 24px';
    button.style.height = '36px';
    button.style.lineHeight = '36px';
    button.style.backgroundColor = '#0b57d0';
    button.style.color = '#ffffff';
    button.style.fontWeight = '500';
    button.style.cursor = 'pointer';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    return button;

}

function findComposedToolbar(){

    const selectors =[
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];

    for(const selector of selectors){

        const toolbar = document.querySelector(selector);
        if(toolbar){
            return toolbar;
        }
        
    }
    return null;

}

function injectButton(){

    const existingButton = document.querySelector('.ai-reply-button');
    if(existingButton) existingButton.remove();

    const toolbar = findComposedToolbar();
    if(!toolbar){
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found" , "creating AI button");

    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click' , async () =>{

        try{

            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate' , {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "emailContent": emailContent,
                    "tone": "professional"
                })

            });

            if(!response.ok){
                throw new Error('API Request Failed')
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText' , false , generatedReply);
            }
            else{
                console.error('Compose box was not found')
            }


        }catch(error){

            console.log(error)
            alert('Failed to generate the reply');

        } finally{

            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button , toolbar.firstChild);
}

const observer = new MutationObserver((mutations) =>{

    for(const mutation of mutations){
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposedElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh , .btC , [role="dialog"]'))
        );

        if(hasComposedElements){
            console.log("Composed window detected")
            setTimeout(injectButton , 500);
        }    
    }
});


observer.observe(document.body ,{
    childList: true,
    subtree: true,
    
});