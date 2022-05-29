/** List of class names that we use throughout the library to manipulate the DOM. */
const CLASS_NAMES = {
    MODAL: 'swal-modal',
    OVERLAY: 'swal-overlay',
    SHOW_MODAL: `swal-overlay--show-modal`,
    MODAL_TITLE: `swal-title`,
    MODAL_TEXT: `swal-text`,
    ICON: 'swal-icon',
    ICON_CUSTOM: `swal-icon--custom`,
    CONTENT: 'swal-content',
    FOOTER: 'swal-footer',
    BUTTON_CONTAINER: 'swal-button-container',
    BUTTON: 'swal-button',
    CONFIRM_BUTTON: `swal-button--confirm`,
    CANCEL_BUTTON: `swal-button--cancel`,
    DANGER_BUTTON: `swal-button--danger`,
    BUTTON_LOADING: `swal-button--loading`,
    BUTTON_LOADER: `swal-button__loader`,
};

//region Function

const stringToNode = (html) => {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    return wrapper.firstChild;
};
const throwErr = (message) => {
    message = message.replace(/ +(?= )/g, '');
    message = message.trim();
    throw `SweetAlert: ${message}`;
};
const isPlainObject = (value) => {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    } else {
        var prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    }
};
const ordinalSuffixOf = (num) => {
    let j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
};

//endregion

//region DOM Structure

const modalMarkup = `<div class="${CLASS_NAMES.MODAL}" role="dialog" aria-modal="true">` + /* Icon-Title-Text-Content-Buttons */ `</div>`;
const overlay = `<div class="${CLASS_NAMES.OVERLAY}" tabIndex="-1"></div>`;
const errorIconMarkup = () => {
    const icon = `${CLASS_NAMES.ICON}--error`;
    const line = `${icon}__line`;
    return `
        <div class="${icon}__x-mark">
            <span class="${line} ${line}--left"></span>
            <span class="${line} ${line}--right"></span>
        </div>
    `;
};
const warningIconMarkup = () => {
    const icon = `${CLASS_NAMES.ICON}--warning`;
    return `
    <span class="${icon}__body">
        <span class="${icon}__dot"></span>
    </span>
    `;
};
const successIconMarkup = () => {
    const icon = `${CLASS_NAMES.ICON}--success`;
    return `
        <span class="${icon}__line ${icon}__line--long"></span>
        <span class="${icon}__line ${icon}__line--tip"></span>
        <div class="${icon}__ring"></div>
        <div class="${icon}__hide-corners"></div>
    `;
};
const contentMarkup = `<div class="${CLASS_NAMES.CONTENT}"></div>`;
const buttonMarkup = `
    <div class="${CLASS_NAMES.BUTTON_CONTAINER}">
        <button class="${CLASS_NAMES.BUTTON}"></button>
        <div class="${CLASS_NAMES.BUTTON_LOADER}">
            <div></div><div></div><div></div>
        </div>
    </div>
`;
const iconMarkup = `<div class="${CLASS_NAMES.ICON}"></div>`;
const titleMarkup = `<div class="${CLASS_NAMES.MODAL_TITLE}"></div>`;
const textMarkup = `<div class="${CLASS_NAMES.MODAL_TEXT}"></div>`;
const footerMarkup = `<div class="${CLASS_NAMES.FOOTER}"></div>`;

//endregion

//region icon

const PREDEFINED_ICONS = ["error", "warning", "success", "info"];
const ICON_CONTENTS = { error: errorIconMarkup(), warning: warningIconMarkup(), success: successIconMarkup() };
const initPredefinedIcon = (type, iconEl) => {
    const iconTypeClass = `${CLASS_NAMES.ICON}--${type}`;
    iconEl.classList.add(iconTypeClass);
    const iconContent = ICON_CONTENTS[type];
    if (iconContent) iconEl.innerHTML = iconContent;
};
const initImageURL = (url, iconEl) => {
    iconEl.classList.add(CLASS_NAMES.ICON_CUSTOM);
    let img = document.createElement('img');
    img.src = url;
    iconEl.appendChild(img);
};
const initIcon = (str) => {
    if (!str) return;
    let iconEl = injectElIntoModal(iconMarkup);
    if (PREDEFINED_ICONS.includes(str))
        initPredefinedIcon(str, iconEl);
    else
        initImageURL(str, iconEl);
};

//endregion

//region Text

const webkitRerender = (el) => {
    if (navigator.userAgent.includes('AppleWebKit')) {
        el.style.display = 'none';
        el.offsetHeight;
        el.style.display = '';
    }
};
const initTitle = (title) => {
    if (title) {
        const titleEl = injectElIntoModal(titleMarkup);
        titleEl.textContent = title;
        webkitRerender(titleEl);
    }
};
const initText = (text) => {
    if (text) {
        let textNode = document.createDocumentFragment();
        text.split('\n').forEach((textFragment, index, array) => {
            textNode.appendChild(document.createTextNode(textFragment));
            // unless we are on the last element, append a <br>
            if (index < array.length - 1)
                textNode.appendChild(document.createElement('br'));
        });
        const textEl = injectElIntoModal(textMarkup);
        textEl.appendChild(textNode);
        webkitRerender(textEl);
    }
};

//endregion

//region Button

const getButton = (namespace, { text, value, className, closeModal, }, dangerMode) => {
    const buttonContainer = stringToNode(buttonMarkup);
    const buttonEl = buttonContainer.querySelector(`.${CLASS_NAMES.BUTTON}`);
    const btnNamespaceClass = `${CLASS_NAMES.BUTTON}--${namespace}`;
    buttonEl.classList.add(btnNamespaceClass);
    if (className) {
        const classNameArray = Array.isArray(className) ? className : className.split(' ');
        classNameArray.filter(name => name.length > 0).forEach(name => buttonEl.classList.add(name));
    }
    if (dangerMode && namespace === CONFIRM_KEY)
        buttonEl.classList.add(CLASS_NAMES.DANGER_BUTTON);
    buttonEl.textContent = text;
    let actionValues = {};
    actionValues[namespace] = value;
    setActionValue(actionValues);
    setActionOptionsFor(namespace, { closeModal });
    buttonEl.addEventListener('click', () => onAction(namespace));
    return buttonContainer;
};
const initButtons = (buttons, dangerMode) => {
    const footerEl = injectElIntoModal(footerMarkup);
    for (let key in buttons) {
        const buttonOpts = buttons[key];
        const buttonEl = getButton(key, buttonOpts, dangerMode);
        if (buttonOpts.visible)
            footerEl.appendChild(buttonEl);
    }
    if (footerEl.children.length === 0)
        footerEl.remove();
};

const CONFIRM_KEY = 'confirm';
const CANCEL_KEY = 'cancel';
const defaultButton = { visible: true, text: null, value: null, className: '', closeModal: true };
const defaultCancelButton = Object.assign({}, defaultButton, { visible: false, text: "Cancel", value: null });
const defaultConfirmButton = Object.assign({}, defaultButton, { text: "OK", value: true });
const defaultButtonList = { cancel: defaultCancelButton, confirm: defaultConfirmButton };
const getDefaultButton = (key) => {
    switch (key) {
        case CONFIRM_KEY:
            return defaultConfirmButton;
        case CANCEL_KEY:
            return defaultCancelButton;
        default:
            const text = key.charAt(0).toUpperCase() + key.slice(1);
            return Object.assign({}, defaultButton, { text, value: key });
    }
};
const normalizeButton = (key, param) => {
    const button = getDefaultButton(key);
    if (param === true) return Object.assign({}, button, { visible: true });
    if (typeof param === "string") return Object.assign({}, button, { visible: true, text: param });
    if (isPlainObject(param)) return Object.assign({ visible: true }, button, param);
    return Object.assign({}, button, { visible: false });
};
const normalizeButtonListObj = (obj) => {
    let buttons = {};
    for (let key of Object.keys(obj))
        buttons[key] = normalizeButton(key, obj[key]);
    if (!buttons.cancel)
        buttons.cancel = defaultCancelButton;
    return buttons;
};
const normalizeButtonArray = (arr) => {
    let buttonListObj = {};
    switch (arr.length) {
        case 1:
            buttonListObj[CANCEL_KEY] = Object.assign({}, defaultCancelButton, { visible: false });
            break;
        case 2:
            buttonListObj[CANCEL_KEY] = normalizeButton(CANCEL_KEY, arr[0]);
            buttonListObj[CONFIRM_KEY] = normalizeButton(CONFIRM_KEY, arr[1]);
            break;
        default:
            throwErr(`Invalid number of 'buttons' in array (${arr.length}). If you want more than 2 buttons, you need to use an object!`);
    }
    return buttonListObj;
};
const getButtonListOpts = (opts) => {
    let buttonListObj = defaultButtonList;
    if (typeof opts === "string") {
        buttonListObj[CONFIRM_KEY] = normalizeButton(CONFIRM_KEY, opts);
    } else if (Array.isArray(opts)) {
        buttonListObj = normalizeButtonArray(opts);
    } else if (isPlainObject(opts)) {
        buttonListObj = normalizeButtonListObj(opts);
    } else if (opts === true) {
        buttonListObj = normalizeButtonArray([true, true]);
    } else if (opts === false) {
        buttonListObj = normalizeButtonArray([false, false]);
    } else if (opts === undefined) {
        buttonListObj = defaultButtonList;
    }
    return buttonListObj;
};

//endregion

//region State

const defaultState = { isOpen: false, promise: null, actions: {}, timer: null };
let state = Object.assign({}, defaultState);
const setActionValue = (opts) => {
    if (typeof opts === "string") return setActionValueForButton(CONFIRM_KEY, opts);
    for (let namespace in opts)
        setActionValueForButton(namespace, opts[namespace]);
};
const setActionValueForButton = (namespace, value) => {
    if (!state.actions[namespace])
        state.actions[namespace] = {};
    Object.assign(state.actions[namespace], { value });
};
const setActionOptionsFor = (buttonKey, { closeModal = true, } = {}) => {
    Object.assign(state.actions[buttonKey], { closeModal });
};

//endregion

//region Action

const openModal = () => {
    let overlay = document.querySelector(`.${CLASS_NAMES.OVERLAY}`);
    overlay.classList.add(CLASS_NAMES.SHOW_MODAL);
    state.isOpen = true;
};
const hideModal = () => {
    let overlay = document.querySelector(`.${CLASS_NAMES.OVERLAY}`);
    overlay.classList.remove(CLASS_NAMES.SHOW_MODAL);
    state.isOpen = false;
};
const onAction = (namespace = CANCEL_KEY) => {
    const { value, closeModal } = state.actions[namespace];
    if (closeModal === false) {
        const buttonClass = `${CLASS_NAMES.BUTTON}--${namespace}`;
        const button = document.querySelector(`.${buttonClass}`);
        button.classList.add(CLASS_NAMES.BUTTON_LOADING);
    } else {
        hideModal();
    }
    state.promise.resolve(value);
};
const getState = () => {
    const publicState = Object.assign({}, state);
    delete publicState.promise;
    delete publicState.timer;
    return publicState;
};
const stopLoading = () => {
    const buttons = document.querySelectorAll(`.${CLASS_NAMES.BUTTON}`);
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.classList.remove(CLASS_NAMES.BUTTON_LOADING);
    }
};

//endregion

//region Modal

const injectElIntoModal = (markup) => {
    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);
    const el = stringToNode(markup);
    modal.appendChild(el);
    return el;
};
/*
 * Remove eventual added classes +
 * reset all content inside:
 */
const resetModalElement = (modal) => {
    modal.className = CLASS_NAMES.MODAL;
    modal.textContent = '';
};
/*
 * Add custom class to modal element
 */
const customizeModalElement = (modal, opts) => {
    resetModalElement(modal);
    const { className } = opts;
    if (className) {
        modal.classList.add(className);
    }
};
/*
 * It's important to run the following functions in this particular order,
 * so that the elements get appended one after the other.
 */
const initModalContent = (opts) => {
    // Start from scratch:
    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);
    customizeModalElement(modal, opts);
    initIcon(opts.icon);
    initTitle(opts.title);
    initText(opts.text);
    initContent(opts.content);
    initButtons(opts.buttons, opts.dangerMode);
};
const initModalOnce = () => {
    const overlay = document.querySelector(`.${CLASS_NAMES.OVERLAY}`);
    const modal = stringToNode(modalMarkup);
    overlay.appendChild(modal);
};
const initOverlayOnce = () => {
    document.body.appendChild(stringToNode(overlay));
};

//endregion

//region EventListener

const onTabAwayLastButton = e => {
    e.preventDefault(); setFirstButtonFocus();
};
const onTabBackFirstButton = e => {
    e.preventDefault();setLastButtonFocus();
};
const onKeyUp = e => {
    if (!state.isOpen) return;
    switch (e.key) {
        case "Escape": return onAction(CANCEL_KEY);
    }
};
const onKeyDownLastButton = e => {
    if (!state.isOpen) return;
    switch (e.key) {
        case "Tab": return onTabAwayLastButton(e);
    }
};
const onKeyDownFirstButton = e => {
    if (!state.isOpen) return;
    if (e.key === "Tab" && e.shiftKey) {
        return onTabBackFirstButton(e);
    }
};
const setFirstButtonFocus = () => {
    const button = document.querySelector(`.${CLASS_NAMES.BUTTON}`);
    if (button) {
        button.tabIndex = 0;
        button.focus();
    }
};
const setLastButtonFocus = () => {
    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);
    const buttons = modal.querySelectorAll(`.${CLASS_NAMES.BUTTON}`);
    const lastIndex = buttons.length - 1;
    const lastButton = buttons[lastIndex];
    if (lastButton) lastButton.focus();
};
const setTabbingForLastButton = buttons => {
    const lastIndex = buttons.length - 1;
    const lastButton = buttons[lastIndex];
    lastButton.addEventListener('keydown', onKeyDownLastButton);
};
const setTabbingForFirstButton = buttons => {
    const firstButton = buttons[0];
    firstButton.addEventListener('keydown', onKeyDownFirstButton);
};
const setButtonTabbing = () => {
    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);
    const buttons = modal.querySelectorAll(`.${CLASS_NAMES.BUTTON}`);
    if (!buttons.length) return;
    setTabbingForLastButton(buttons);
    setTabbingForFirstButton(buttons);
};
const onOutsideClick = (e) => {
    const overlay = document.querySelector(`.${CLASS_NAMES.OVERLAY}`);
    if (overlay !== e.target) return;
    return onAction(CANCEL_KEY);
};
const setClickOutside = (allow) => {
    const overlay = document.querySelector(`.${CLASS_NAMES.OVERLAY}`);
    overlay.removeEventListener('click', onOutsideClick);
    if (allow) {
        overlay.addEventListener('click', onOutsideClick);
    }
};
const setTimer = (ms) => {
    if (state.timer) clearTimeout(state.timer);
    if (ms) state.timer = window.setTimeout(() => onAction(CANCEL_KEY), ms);
};
const addEventListeners = (opts) => {
    if (opts.closeOnEsc) {
        document.addEventListener('keyup', onKeyUp);
    } else {
        document.removeEventListener('keyup', onKeyUp);
    }
    /* So that you don't accidentally confirm something dangerous by clicking enter */
    if (opts.dangerMode) {
        setFirstButtonFocus();
    } else {
        setLastButtonFocus();
    }
    setButtonTabbing();
    setClickOutside(opts.closeOnClickOutside);
    setTimer(opts.timer);
};

//endregion

//region Content

const addInputEvents = (input) => {
    input.addEventListener('input', (e) => {
        const target = e.target;
        const text = target.value;
        setActionValue(text);
    });
    input.addEventListener('keyup', (e) => {
        if (e.key === "Enter")
            return onAction(CONFIRM_KEY);
    });
    setTimeout(() => {
        input.focus();
        setActionValue('');
    }, 0);
};
const initPredefinedContent = (content, elName, attrs) => {
    const el = document.createElement(elName);
    const elClass = `${CLASS_NAMES.CONTENT}__${elName}`;
    el.classList.add(elClass);
    for (let key in attrs) el[key] = attrs[key];
    if (elName === "input") addInputEvents(el);
    content.appendChild(el);
};
const initContent = (opts) => {
    if (!opts) return;
    const content = injectElIntoModal(contentMarkup);
    const { element, attributes } = opts;
    if (typeof element === "string")
        initPredefinedContent(content, element, attributes);
    else
        content.appendChild(element);
};

const defaultInputOptions = { element: 'input', attributes: { placeholder: "" } };
const getContentOpts = (contentParam) => {
    let opts = {};
    if (isPlainObject(contentParam)) return Object.assign(opts, contentParam);
    if (contentParam instanceof Element) return { element: contentParam };
    if (contentParam === 'input') return defaultInputOptions;
    return null;
};

//endregion

//region Option

const defaultOpts = {
    title: null,
    text: null,
    icon: null,
    buttons: defaultButtonList,
    content: null,
    className: null,
    closeOnClickOutside: true,
    closeOnEsc: true,
    dangerMode: false,
    timer: null,
};
let userDefaults = Object.assign({}, defaultOpts);
const setDefaults = (opts) => userDefaults = Object.assign({}, defaultOpts, opts);
const pickButtonParam = (opts) => {
    const singleButton = opts && opts.button;
    const buttonList = opts && opts.buttons;
    if (singleButton !== undefined && buttonList !== undefined)
        throwErr(`Cannot set both 'button' and 'buttons' options!`);
    return singleButton !== undefined ? {confirm: singleButton} : buttonList;
};
// Example 0 -> 1st
const indexToOrdinal = (index) => ordinalSuffixOf(index + 1);
const invalidParam = (param, index) => {
    throwErr(`${indexToOrdinal(index)} argument ('${param}') is invalid`);
};
const expectOptionsOrNothingAfter = (index, allParams) => {
    let nextIndex = (index + 1);
    let nextParam = allParams[nextIndex];
    if (!isPlainObject(nextParam) && nextParam !== undefined)
        throwErr(`Expected ${indexToOrdinal(nextIndex)} argument ('${nextParam}') to be a plain object`);
};
const expectNothingAfter = (index, allParams) => {
    let nextIndex = (index + 1);
    let nextParam = allParams[nextIndex];
    if (nextParam !== undefined)
        throwErr(`Unexpected ${indexToOrdinal(nextIndex)} argument (${nextParam})`);
};
const paramToOption = (param, index, allParams) => {
    const paramType = (typeof param);
    const isString = (paramType === "string");
    const isDOMNode = (param instanceof Element);
    if (isString) {
        if (index === 0) {
            // Example: swal("Hi there!");
            return { text: param };
        } else if (index === 1) {
            // Example: swal("Wait!", "Are you sure you want to do this?");
            // (The text is now the second argument)
            return { text: param, title: allParams[0] };
        } else if (index === 2) {
            // Example: swal("Wait!", "Are you sure?", "warning");
            expectOptionsOrNothingAfter(index, allParams);
            return { icon: param, };
        } else {
            invalidParam(param, index);
        }
    } else if (isDOMNode && index === 0) {
        // Example: swal(<DOMNode />);
        expectOptionsOrNothingAfter(index, allParams);
        return { content: param };
    } else if (isPlainObject(param)) {
        expectNothingAfter(index, allParams);
        return param;
    } else {
        invalidParam(param, index);
    }
};
const getOpts = (...params) => {
    let opts = {};
    params.forEach((param, index) => {
        let changes = paramToOption(param, index, params);
        Object.assign(opts, changes);
    });
    // Since Object.assign doesn't deep clone, we need to do this:
    let buttonListOpts = pickButtonParam(opts);
    opts.buttons = getButtonListOpts(buttonListOpts);
    delete opts.button;
    opts.content = getContentOpts(opts.content);
    return Object.assign({}, defaultOpts, userDefaults, opts);
};

//endregion

export const swal = (...args) => {
    // Prevent library to be run in Node env:
    if (typeof window === 'undefined') return;
    const opts = getOpts(...args);
    return new Promise((resolve, reject) => {
        state.promise = { resolve, reject };
        const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);
        if (!modal) {
            if (!document.body) throwErr("You can only use SweetAlert AFTER the DOM has loaded!");
            initOverlayOnce();
            initModalOnce();
        }
        initModalContent(opts);
        addEventListeners(opts);
        // For fade animation to work:
        setTimeout(() => openModal());
    });
};
swal.close = onAction;
swal.getState = getState;
swal.setActionValue = setActionValue;
swal.stopLoading = stopLoading;
swal.setDefaults = setDefaults;

export const alertFeature = () => {
    let sheet = new CSSStyleSheet();
    sheet.replace(`
    .${CLASS_NAMES.ICON}--error { border-color: #f27474; animation: animateErrorIcon .5s }
    
    .${CLASS_NAMES.ICON}--error__x-mark { position: relative; display: block; animation: animateXMark .5s }
    
    .${CLASS_NAMES.ICON}--error__line { position: absolute; height: 5px; width: 47px; background-color: #f27474; display: block; top: 37px; border-radius: 2px }
    
    .${CLASS_NAMES.ICON}--error__line--left { transform: rotate(45deg); left: 17px }
    
    .${CLASS_NAMES.ICON}--error__line--right { transform: rotate(-45deg); right: 16px }
    
    @keyframes animateErrorIcon {
        0% { transform: rotateX(100deg); opacity: 0 }
        to { transform: rotateX(0deg); opacity: 1 }
    }
    
    @keyframes animateXMark {
        0% { transform: scale(.4); margin-top: 26px; opacity: 0 }
        50% { transform: scale(.4); margin-top: 26px; opacity: 0 }
        80% { transform: scale(1.15); margin-top: -6px }
        to { transform: scale(1); margin-top: 0; opacity: 1 }
    }
    
    .${CLASS_NAMES.ICON}--warning { border-color: #f8bb86; animation: pulseWarning .75s infinite alternate }
    
    .${CLASS_NAMES.ICON}--warning__body { width: 5px; height: 47px; top: 10px; border-radius: 2px; margin-left: -2px }
    
    .${CLASS_NAMES.ICON}--warning__body, .${CLASS_NAMES.ICON}--warning__dot { position: absolute; left: 50%; background-color: #f8bb86 }
    
    .${CLASS_NAMES.ICON}--warning__dot { width: 7px; height: 7px; border-radius: 50%; margin-left: -4px; bottom: -11px }
    
    @keyframes pulseWarning {
        0% { border-color: #f8d486 }
        to { border-color: #f8bb86 }
    }
    
    .${CLASS_NAMES.ICON}--success { border-color: #a5dc86 }
    
    .${CLASS_NAMES.ICON}--success:after, .${CLASS_NAMES.ICON}--success:before { content: ""; border-radius: 50%; position: absolute; width: 60px; height: 120px; background: #fff; transform: rotate(45deg) }
    
    .${CLASS_NAMES.ICON}--success:before { border-radius: 120px 0 0 120px; top: -7px; left: -33px; transform: rotate(-45deg); transform-origin: 60px 60px }
    
    .${CLASS_NAMES.ICON}--success:after { border-radius: 0 120px 120px 0; top: -11px; left: 30px; transform: rotate(-45deg); transform-origin: 0 60px; animation: rotatePlaceholder 4.25s ease-in }
    
    .${CLASS_NAMES.ICON}--success__ring { width: 80px; height: 80px; border: 4px solid hsla(98, 55%, 69%, .2); border-radius: 50%; box-sizing: content-box; position: absolute; left: -4px; top: -4px; z-index: 2 }
    
    .${CLASS_NAMES.ICON}--success__hide-corners { width: 5px; height: 90px; background-color: #fff; padding: 1px; position: absolute; left: 28px; top: 8px; z-index: 1; transform: rotate(-45deg) }
    
    .${CLASS_NAMES.ICON}--success__line { height: 5px; background-color: #a5dc86; display: block; border-radius: 2px; position: absolute; z-index: 2 }
    
    .${CLASS_NAMES.ICON}--success__line--tip { width: 25px; left: 14px; top: 46px; transform: rotate(45deg); animation: animateSuccessTip .75s }
    
    .${CLASS_NAMES.ICON}--success__line--long { width: 47px; right: 8px; top: 38px; transform: rotate(-45deg); animation: animateSuccessLong .75s }
    
    @keyframes rotatePlaceholder {
        0% { transform: rotate(-45deg) }
        5% { transform: rotate(-45deg) }
        12% { transform: rotate(-405deg) }
        to { transform: rotate(-405deg) }
    }
    
    @keyframes animateSuccessTip {
        0% { width: 0; left: 1px; top: 19px }
        54% { width: 0; left: 1px; top: 19px }
        70% { width: 50px; left: -8px; top: 37px }
        84% { width: 17px; left: 21px; top: 48px }
        to { width: 25px; left: 14px; top: 45px }
    }
    
    @keyframes animateSuccessLong {
        0% { width: 0; right: 46px; top: 54px }
        65% { width: 0; right: 46px; top: 54px }
        84% { width: 55px; right: 0; top: 35px }
        to { width: 47px; right: 8px; top: 38px }
    }
    
    .${CLASS_NAMES.ICON}--info { border-color: #c9dae1 }
    
    .${CLASS_NAMES.ICON}--info:before { width: 5px; height: 29px; bottom: 17px; border-radius: 2px; margin-left: -2px }
    
    .${CLASS_NAMES.ICON}--info:after, .${CLASS_NAMES.ICON}--info:before { content: ""; position: absolute; left: 50%; background-color: #c9dae1 }
    
    .${CLASS_NAMES.ICON}--info:after { width: 7px; height: 7px; border-radius: 50%; margin-left: -3px; top: 19px }
    
    .${CLASS_NAMES.ICON} { width: 80px; height: 80px; border-width: 4px; border-style: solid; border-radius: 50%; padding: 0; position: relative; box-sizing: content-box; margin: 20px auto }
    
    .${CLASS_NAMES.ICON}:first-child { margin-top: 32px }
    
    .${CLASS_NAMES.ICON_CUSTOM} { width: auto; height: auto; max-width: 100%; border: none; border-radius: 0 }
    
    .${CLASS_NAMES.ICON} img { max-width: 100%; max-height: 100% }
    
    .${CLASS_NAMES.MODAL_TITLE} { color: rgba(0, 0, 0, .65); font-weight: 600; text-transform: none; position: relative; display: block; padding: 13px 16px; font-size: 27px; line-height: normal; text-align: center; margin-bottom: 0 }
    
    .${CLASS_NAMES.MODAL_TITLE}:first-child { margin-top: 26px }
    
    .${CLASS_NAMES.MODAL_TITLE}:not(:first-child) { padding-bottom: 0 }
    
    .${CLASS_NAMES.MODAL_TITLE}:not(:last-child) { margin-bottom: 13px }
    
    .${CLASS_NAMES.MODAL_TEXT} { font-size: 16px; position: relative; float: none; line-height: normal; vertical-align: top; text-align: left; display: inline-block; margin: 0; padding: 0 10px; font-weight: 400; color: rgba(0, 0, 0, .64); max-width: calc(100% - 20px); overflow-wrap: break-word; box-sizing: border-box }
    
    .${CLASS_NAMES.MODAL_TEXT}:first-child { margin-top: 45px }
    
    .${CLASS_NAMES.MODAL_TEXT}:last-child { margin-bottom: 45px }
    
    .${CLASS_NAMES.FOOTER} { text-align: center; margin-top: 13px; padding: 13px 16px; border-radius: inherit; border-top-left-radius: 0; border-top-right-radius: 0 }
    
    .${CLASS_NAMES.BUTTON_CONTAINER} { margin: 5px; display: inline-block; position: relative }
    
    .${CLASS_NAMES.BUTTON} { background-color: #7cd1f9; color: #fff; border: none; box-shadow: none; border-radius: 5px; font-weight: 600; font-size: 14px; padding: 10px 24px; margin: 0; cursor: pointer }
    
    .${CLASS_NAMES.BUTTON}:not([disabled]):hover { background-color: #78cbf2 }
    
    .${CLASS_NAMES.BUTTON}:active { background-color: #70bce0 }
    
    .${CLASS_NAMES.BUTTON}:focus { outline: none; box-shadow: 0 0 0 1px #fff, 0 0 0 3px rgba(43, 114, 165, .29) }
    
    .${CLASS_NAMES.BUTTON}[disabled] { opacity: .5; cursor: default }
    
    .${CLASS_NAMES.BUTTON}::-moz-focus-inner { border: 0 }
    
    .${CLASS_NAMES.CANCEL_BUTTON} { color: #555; background-color: #efefef }
    
    .${CLASS_NAMES.CANCEL_BUTTON}:not([disabled]):hover { background-color: #e8e8e8 }
    
    .${CLASS_NAMES.CANCEL_BUTTON}:active { background-color: #d7d7d7 }
    
    .${CLASS_NAMES.CANCEL_BUTTON}:focus { box-shadow: 0 0 0 1px #fff, 0 0 0 3px rgba(116, 136, 150, .29) }
    
    .${CLASS_NAMES.DANGER_BUTTON} {  background-color: #e64942 }
    
    .${CLASS_NAMES.DANGER_BUTTON}:not([disabled]):hover { background-color: #df4740 }
    
    .${CLASS_NAMES.DANGER_BUTTON}:active { background-color: #cf423b }
    
    .${CLASS_NAMES.DANGER_BUTTON}:focus { box-shadow: 0 0 0 1px #fff, 0 0 0 3px rgba(165, 43, 43, .29) }
    
    .${CLASS_NAMES.CONTENT} { padding: 0 20px; margin-top: 20px; font-size: medium }
    
    .${CLASS_NAMES.CONTENT}:last-child { margin-bottom: 20px }
    
    .${CLASS_NAMES.CONTENT}__input, .${CLASS_NAMES.CONTENT}__textarea { -webkit-appearance: none; background-color: #fff; font-size: 14px; display: block; box-sizing: border-box; width: 100%; border: 1px solid rgba(0, 0, 0, .14); padding: 10px 13px; border-radius: 2px; transition: border-color .2s }
    
    .${CLASS_NAMES.CONTENT}__input:focus, .${CLASS_NAMES.CONTENT}__textarea:focus { outline: none; border-color: #6db8ff }
    
    .${CLASS_NAMES.CONTENT}__textarea { resize: vertical }
    
    .${CLASS_NAMES.BUTTON_LOADING} { color: transparent }
    
    .${CLASS_NAMES.BUTTON_LOADING} ~ .${CLASS_NAMES.BUTTON_LOADER} { opacity: 1 }
    
    .${CLASS_NAMES.BUTTON_LOADER} { position: absolute; height: auto; width: 43px; z-index: 2; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); text-align: center; pointer-events: none; opacity: 0 }
    
    .${CLASS_NAMES.BUTTON_LOADER} div { display: inline-block; float: none; vertical-align: baseline; width: 9px; height: 9px; padding: 0; border: none; margin: 2px; opacity: .4; border-radius: 7px; background-color: hsla(0, 0%, 100%, .9); transition: background .2s; animation: swal-loading-anim 1s infinite }
    
    .${CLASS_NAMES.BUTTON_LOADER} div:nth-child(3n+2) { animation-delay: .15s }
    
    .${CLASS_NAMES.BUTTON_LOADER} div:nth-child(3n+3) { animation-delay: .3s }
    
    @keyframes swal-loading-anim {
        0% { opacity: .4 }
        20% { opacity: .4 }
        50% { opacity: 1 }
        to { opacity: .4 }
    }
    
    .${CLASS_NAMES.OVERLAY} { position: fixed; top: 0; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0; overflow-y: auto; background-color: rgba(0, 0, 0, .4); z-index: 10000; pointer-events: none; opacity: 0; transition: opacity .3s }
    
    .${CLASS_NAMES.OVERLAY}:before { content: " "; display: inline-block; vertical-align: middle; height: 100% }
    
    .${CLASS_NAMES.SHOW_MODAL} { opacity: 1; pointer-events: auto }
    
    .${CLASS_NAMES.SHOW_MODAL} .${CLASS_NAMES.MODAL} { opacity: 1; pointer-events: auto; box-sizing: border-box; animation: showSweetAlert .3s; will-change: transform }
    
    .${CLASS_NAMES.MODAL} { width: 478px; opacity: 0; pointer-events: none; background-color: #fff; text-align: center; border-radius: 8px; position: static; margin: 20px auto; display: inline-block; vertical-align: middle; transform: scale(1); transform-origin: 50% 50%; z-index: 10001; transition: transform .3s, opacity .2s }
    
    @media (max-width: 500px) { .${CLASS_NAMES.MODAL} { width: calc(100% - 20px) } }
    
    @keyframes showSweetAlert {
        0%  { transform: scale(1) }
        1%  { transform: scale(.5) }
        45% { transform: scale(1.05) }
        80% { transform: scale(.95) }
        to  { transform: scale(1) }
    }`);
    document.adoptedStyleSheets.push(sheet);
}
