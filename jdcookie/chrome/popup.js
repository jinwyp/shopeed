const buttonSearchCookies = document.querySelectorAll(".btn-show-cookie");
const textInputSearchFilterCookie = document.querySelector("#input-search-filter-cookie");

const ulContentCookieList = document.querySelector("#cookie-list");
const ulContentCookieListPtKeyPtPin = document.querySelector("#cookie-pt-key-pt-pin");

const spanContentPtKeyAndPin = document.querySelector("#jd_pt_key_pin");
const spanContentPtKey = document.querySelector("#jd_pt_key");
const spanContentPtPin = document.querySelector("#jd_pt_pin");

const spanContentBingCookie = document.querySelector("#bing_cookie");

const divContentBing = document.querySelector("#bing");
const divContentJd = document.querySelector("#jd");


const isDebug = false;
let apiPrefix = isDebug ? 'http://localhost:8088' : 'http://tgfcer.jscool.net'
let currentUsername = '';
let currentUserId = '';

let allCookies = {
    stringCookie: '',
    objectCookie: {},
    arrayCookie: []
}





// Chrome API Function 

async function chromeGetCurrentTab() {

    let queryOptions = { active: true, currentWindow: true }
    let tabList = await chrome.tabs.query(queryOptions)
    let [tab] = tabList

    console.log("currentTabList: ", tabList);
    console.log("currentTab: ", tab);
    return tab;
}


async function chromeGetAllCookies(domain) {

    let tempCookieList = await chrome.cookies.getAll({ domain: domain })

    console.log("===== chromeGetAllCookies ====== ")
    console.log(tempCookieList);

    let stringCookie = ''
    let objectCookie = {}

    if (tempCookieList.length > 0) {

        for (var i = 0; i < tempCookieList.length; i++) {
            let tempOneCookie = tempCookieList[i]
            if (tempOneCookie.name) {
                stringCookie = stringCookie + tempOneCookie.name + "=" + tempOneCookie.value + "; ";
                objectCookie[tempOneCookie.name] = tempOneCookie.value
            }
        }
    }

    return {
        stringCookie,
        objectCookie,
        arrayCookie: tempCookieList
    }
}


// Chrome Storage function

function saveUserFavoriteLinkListToSyncStorage(linkList) {
    if (linkList && Array.isArray(linkList)) {
        const linkListTemp = linkList.map(link => {
            return link.threadId
        })
        chrome.storage.sync.set({ tgfcerUserFavoriteLinkIdList: linkListTemp }, function() {
            console.log('Chrome Sync storage saved data: ', linkListTemp)
        })
    }
}

function getChromeData() {
    chrome.storage.sync.get(null, function(result) {
        console.log(`===== Chrome.storage get currently is `, result);

        if (result) {
            // callback (null, result[key])
            currentUsername = result.tgfcerCurrentUsername || '';
            currentUserId = result.tgfcerCurrentUserId || '';
        }
    });
}



// Tools function
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}



function fallbackCopyTextToClipboard(text) {

    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
        alert("Already copy To Clipboard! ")
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}


function getDomainFromUrl(url) {
    var domain = {
        subDomain: '',
        domainWithHttps: '',
        domain: ''
    }

    // console.log("current url: ", url)
    var urlWithoutHttpOrWWW = url.replace(/(https?:\/\/)?(www.)?/i, '');
    // console.log("urlWithoutHttpOrWWW: ", urlWithoutHttpOrWWW)

    var urlArray = url.split("/");
    console.log("urlArray: ", urlArray)

    var domainArray = urlArray[2].split('.');
    var topDomain = domainArray.slice(-2).join('.');
    console.log("domainArray : ", domainArray);

    domain.subDomain = urlArray[0] + '//' + urlArray[2]
    domain.domainWithHttps = urlArray[0] + '//' + topDomain
    domain.domain = topDomain

    console.log("currentTabDomain : ", domain);

    return domain
}









// Main Feature Function


async function showCurrentBox(boxIdString) {

    if (!boxIdString) {
        let currentTab = await chromeGetCurrentTab();
        boxIdString = currentTab.url;
    }

    console.log("===== currentUrl: ", boxIdString)
    if (boxIdString.indexOf('bing') > -1) {
        divContentJd.classList.add("d-none");
        divContentBing.classList.remove("d-none");
    }else {
        divContentJd.classList.remove("d-none");
        divContentBing.classList.add("d-none");
    }

}

function clearList() {
    ulContentCookieList.innerHTML = '';
}


let liCounter = 1;
function appendList(text) {

    var li = document.createElement("li");
    li.setAttribute("id", "element_" + liCounter);
    li.appendChild(document.createTextNode(text));
    li.classList.add("list-group-item");
    ulContentCookieList.appendChild(li);
    liCounter = liCounter + 1
}

function modifyText(node, text) {
    node.textContent = text;
}








function delegateSelectLi() {
    ulContentCookieList.addEventListener("click", function(e) {
        if (e.target && e.target.nodeName == "LI") {
            // List item found!  Output the ID!
            console.log("List item ", e.target.id, " was clicked!");
            copyTextToClipboard(e.target.innerHTML)
        }
    });

    ulContentCookieListPtKeyPtPin.addEventListener("click", function(e) {
        if (e.target && e.target.nodeName == "LI") {
            // List item found!  Output the ID!
            console.log("List item ", e.target.id, " was clicked!");
            copyTextToClipboard(e.target.innerHTML)
        }
    });


    buttonSearchCookies.forEach((tempButton) => {
        tempButton.addEventListener('click', onClickButtonSearchCookie, false);
    })

}


async function showFilterCookieList(list) {
    let inputFilterText = document.querySelector("#input-search-filter-cookie").value

    if (list.arrayCookie.length > 0) {

        clearList();
        if (inputFilterText) {
            list.arrayCookie.forEach((tempOneCookie) => {
                if (tempOneCookie.name && tempOneCookie.name.indexOf(inputFilterText) > -1) {
                    appendList(tempOneCookie.name + "=" + tempOneCookie.value + "; ")
                }
            })
        } else {
            list.arrayCookie.forEach((tempOneCookie2) => {
                if (tempOneCookie2.name) {
                    appendList(tempOneCookie2.name + "=" + tempOneCookie2.value + "; ")
                }
            })
        }
    }
}


async function onClickButtonSearchCookie(event3) {
    event3.preventDefault()

    let currentTab = await chromeGetCurrentTab();
    var domain = getDomainFromUrl(currentTab.url)

    let inputDomainText = document.querySelector("#input-domaintext")
    let inputCurrentDomain = inputDomainText.value

    console.log("===== inputDomain value: ", inputDomainText.value)

    if (!inputCurrentDomain) {
        inputDomainText.value = domain.domain
        inputCurrentDomain = domain.domain
        console.log("===== inputCurrentDomain: ", inputCurrentDomain)
    }

    allCookies = await chromeGetAllCookies(inputCurrentDomain)

    await showFilterCookieList(allCookies)

    modifyText(spanContentPtKey, "pt_key=" + allCookies.objectCookie.pt_key + ";")
    modifyText(spanContentPtPin, "pt_pin=" + allCookies.objectCookie.pt_pin + ";")
    modifyText(spanContentPtKeyAndPin, "pt_key=" + allCookies.objectCookie.pt_key + ";" + "pt_pin=" + allCookies.objectCookie.pt_pin + ";")

    modifyText(spanContentBingCookie, allCookies.stringCookie)

}


async function onClickInputFilterCookies(event3) {
    await showFilterCookieList(allCookies)
}


// buttonSearchCookies.addEventListener('click', onClickButtonSearchCookie, false);
textInputSearchFilterCookie.addEventListener('input', onClickInputFilterCookies, false);



delegateSelectLi()
showCurrentBox()
// getChromeData()

