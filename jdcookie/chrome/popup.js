const buttonSearchCookies = document.querySelector("#btn-show-cookie");
const buttonDeleteCookies = document.querySelector("#btn-del-cookie");
const buttonDeleteLocalStorage = document.querySelector("#btn-del-localstorage");
const inputTextSearchFilterCookie = document.querySelector("#input-search-filter-cookie");
const inputTextDomainByUserInput = document.querySelector("#input-domaintext")

const ulContentCookieList = document.querySelector("#cookie-list");
const ulContentCookieListPtKeyPtPin = document.querySelector("#cookie-pt-key-pt-pin");


const spanContentBingCookie = document.querySelector("#bing_cookie");
const spanContentPtKeyAndPin = document.querySelector("#jd_pt_key_pin");
const spanContentPtKey = document.querySelector("#jd_pt_key");
const spanContentPtPin = document.querySelector("#jd_pt_pin");

const divElementContentList = document.querySelectorAll("[class*=site_intro]");;
const inputElementContentList = document.querySelectorAll("[class*=site_input]");;



const isDebug = false;

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

    // console.log("currentTabList: ", tabList);
    // console.log("currentTab: ", tab);
    return tab;
}

async function chromeGetAllCookies(domain) {

    let tempCookieList = await chrome.cookies.getAll({ domain: domain })
    console.log("===== chromeGetAllCookies :", tempCookieList)

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

async function chromeRemoveAllCookies(domain){
    chrome.cookies.getAll({ domain: domain }, (cookies) => {
        // Loop through each cookie and remove it
        for (const cookie of cookies) {
            chrome.cookies.remove({ url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`, name: cookie.name });
        }
        alert("All Cookies removed");
    });
}

async function chromeRemoveLocalStorage(domain){
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
        alert("All LocalStorage removed");
    });
    chrome.storage.sync.clear(); // callback is optional
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


async function getDomainFromUrl() {

    let currentTab = await chromeGetCurrentTab();
    let url = currentTab.url;

    let domain = {
        topDomainId: '',

        topDomain: '',
        subDomain: '',

        topDomainWithHttps: '',
        subDomainWithHttps: ''
    }

    let urlWithoutHttpOrWWW = url.replace(/(https?:\/\/)?(www.)?/i, '');
    // console.log("urlWithoutHttpOrWWW: ", urlWithoutHttpOrWWW)

    let urlArray = url.split("/");
    // console.log("urlArray: ", urlArray)

    let domainArray = urlArray[2].split('.');
    // console.log("domainArray : ", domainArray);

    domain.topDomainId = domainArray.slice(-2, -1).join('');
    domain.topDomain = domainArray.slice(-2).join('.');
    domain.subDomain = urlArray[2]
    domain.topDomainWithHttps = urlArray[0] + '//' + domain.topDomain
    domain.subDomainWithHttps = urlArray[0] + '//' + urlArray[2]

    // console.log("currentTabDomain : ", domain);

    return domain
}






// Main Feature Function


async function showCurrentBox(siteIdString) {

    if (!siteIdString) {
        let domain = await getDomainFromUrl();
        siteIdString = domain.topDomainId;
    }

    console.log("===== currentSiteId: ", siteIdString)

    // 根据不同网站显示不同的介绍说明
    let counterDiv = 0;
    let tempIntroDiv = null;

    let counterInput = 0;
    let tempSpan = null;

    divElementContentList.forEach((tempDiv) => {
        if (tempDiv.className.indexOf(siteIdString) > -1) {
            tempDiv.classList.remove("d-none");
            counterDiv = counterDiv + 1;
        } else {
            tempDiv.classList.add("d-none");
        }
        if (tempDiv.className.indexOf('other') > -1) {
            tempIntroDiv = tempDiv
        }
    })

    if (counterDiv === 0) {
        tempIntroDiv.classList.remove("d-none");
    }

    // 根据不同网站显示不同的输入框
    inputElementContentList.forEach((tempDiv2) => {
        if (tempDiv2.className.indexOf(siteIdString) > -1) {
            tempDiv2.classList.remove("d-none");
            counterInput = counterInput + 1;
        } else {
            tempDiv2.classList.add("d-none");
        }
        if (tempDiv2.className.indexOf('other') > -1) {
            tempSpan = tempDiv2
        }
    })

    if (counterInput === 0) {
        tempSpan.classList.remove("d-none");
    }

    if (siteIdString.indexOf('jd') > -1 ) {
        inputTextDomainByUserInput.placeholder='https://home.m.jd.com';
    } else if (siteIdString.indexOf('bing') > -1 ) {
        inputTextDomainByUserInput.placeholder='https://www.bing.com/images/create';
    }

    // 根据不同网站显示不同的Cookie列表
    if (siteIdString.indexOf('jd') > -1 ) {
        spanContentPtKeyAndPin.classList.remove("d-none");
        spanContentPtKey.classList.remove("d-none");
        spanContentPtPin.classList.remove("d-none");
        spanContentBingCookie.classList.add("d-none");
    } else {
        spanContentBingCookie.classList.remove("d-none");
        spanContentPtKeyAndPin.classList.add("d-none");
        spanContentPtKey.classList.add("d-none");
        spanContentPtPin.classList.add("d-none");
    }
}

function htmlClearList() {
    ulContentCookieList.innerHTML = '';
}

let liCounter = 1;
function htmlAppendList(text) {

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

    // buttonSearchCookies.forEach((tempButton) => {
    //     tempButton.addEventListener('click', onClickButtonSearchCookie, false);
    // })

}


async function showFilterCookieList(list) {
    let inputFilterText = document.querySelector("#input-search-filter-cookie").value

    if (list.arrayCookie.length > 0) {

        htmlClearList();
        if (inputFilterText) {
            list.arrayCookie.forEach((tempOneCookie) => {
                if (tempOneCookie.name && tempOneCookie.name.indexOf(inputFilterText) > -1) {
                    htmlAppendList(tempOneCookie.name + "=" + tempOneCookie.value + "; ")
                }
            })
        } else {
            list.arrayCookie.forEach((tempOneCookie2) => {
                if (tempOneCookie2.name) {
                    htmlAppendList(tempOneCookie2.name + "=" + tempOneCookie2.value + "; ")
                }
            })
        }
    }
}


async function onClickButtonSearchCookie(event3) {
    event3.preventDefault()

    let domain = await getDomainFromUrl();

    let inputCurrentDomain = inputTextDomainByUserInput.value

    // console.log("===== inputTextDomainByUserInput value: ", inputTextDomainByUserInput.value)

    if (!inputCurrentDomain) {
        inputTextDomainByUserInput.value = domain.topDomain
        inputCurrentDomain = domain.topDomain
        console.log("===== inputCurrentDomain: ", inputCurrentDomain)
    }

    allCookies = await chromeGetAllCookies(inputCurrentDomain)
    await showFilterCookieList(allCookies)


    if (domain.topDomainId.indexOf('jd') > -1 ) {
        modifyText(spanContentPtKey, "pt_key=" + allCookies.objectCookie.pt_key + ";")
        modifyText(spanContentPtPin, "pt_pin=" + allCookies.objectCookie.pt_pin + ";")
        modifyText(spanContentPtKeyAndPin, "pt_key=" + allCookies.objectCookie.pt_key + ";" + "pt_pin=" + allCookies.objectCookie.pt_pin + ";")
    } else {
        modifyText(spanContentBingCookie, allCookies.stringCookie)
    }

}


async function onClickInputFilterCookies(event3) {
    await showFilterCookieList(allCookies)
}

async function onClickButtonDeleteCookie(event5) {
    event5.preventDefault()
    let domain = await getDomainFromUrl();
    chromeRemoveAllCookies(domain.topDomain)
}

async function onClickButtonDeleteLocalStorage(event5) {
    event5.preventDefault()
    // let domain = await getDomainFromUrl();
    chromeRemoveLocalStorage()
}

buttonSearchCookies.addEventListener('click', onClickButtonSearchCookie, false);
buttonDeleteCookies.addEventListener('click', onClickButtonDeleteCookie, false);
buttonDeleteLocalStorage.addEventListener('click', onClickButtonDeleteLocalStorage, false);
inputTextSearchFilterCookie.addEventListener('input', onClickInputFilterCookies, false);



delegateSelectLi()
showCurrentBox()


