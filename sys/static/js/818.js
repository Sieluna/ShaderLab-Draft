"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[818],{

/***/ 818:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "alertFeature": () => (/* binding */ alertFeature),
  "swal": () => (/* binding */ swal)
});

// NAMESPACE OBJECT: ./sys/public/css/shared/alert.css
var alert_namespaceObject = {};
__webpack_require__.r(alert_namespaceObject);

;// CONCATENATED MODULE: ./sys/public/css/shared/alert.css
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./sys/public/js/element/shared/alert.js


/*
 * Get a DOM element from a class name:
 */
const getNode = (className) => {
    const selector = `.${className}`;
    return document.querySelector(selector);
};
const stringToNode = (html) => {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    return wrapper.firstChild;
};
const throwErr = (message) => {
    // Remove multiple spaces:
    message = message.replace(/ +(?= )/g, '');
    message = message.trim();
    throw `SweetAlert: ${message}`;
};
/*
 * Match plain objects ({}) but NOT null
 */
const isPlainObject = (value) => {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }
    else {
        var prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    }
};
/*
 * Take a number and return a version with ordinal suffix
 * Example: 1 => 1st
 */
const ordinalSuffixOf = (num) => {
    let j = num % 10;
    let k = num % 100;
    if (j === 1 && k !== 11) {
        return `${num}st`;
    }
    if (j === 2 && k !== 12) {
        return `${num}nd`;
    }
    if (j === 3 && k !== 13) {
        return `${num}rd`;
    }
    return `${num}th`;
};

/*
 * List of class names that we
 * use throughout the library to
 * manipulate the DOM.
 */
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

const modalMarkup = `<div class="${CLASS_NAMES.MODAL}" role="dialog" aria-modal="true">` + /* Icon-Title-Text-Content-Buttons */ `</div>`;

const overlay = `<div class="${CLASS_NAMES.OVERLAY}" tabIndex="-1"></div>`;

const errorIconMarkup = () => {
    const icon = `${CLASS_NAMES.ICON}--error`;
    const line = `${icon}__line`;
    const markup = `
    <div class="${icon}__x-mark">
      <span class="${line} ${line}--left"></span>
      <span class="${line} ${line}--right"></span>
    </div>
  `;
    return markup;
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

    <button
      class="${CLASS_NAMES.BUTTON}"
    ></button>

    <div class="${CLASS_NAMES.BUTTON_LOADER}">
      <div></div>
      <div></div>
      <div></div>
    </div>

  </div>
`;

const iconMarkup = `
  <div class="${CLASS_NAMES.ICON}"></div>`;
const titleMarkup = `
  <div class="${CLASS_NAMES.MODAL_TITLE}"></div>
`;
const textMarkup = `
  <div class="${CLASS_NAMES.MODAL_TEXT}"></div>`;
const footerMarkup = `
  <div class="${CLASS_NAMES.FOOTER}"></div>
`;

//import { stringToNode } from '../utils';
const PREDEFINED_ICONS = ["error", "warning", "success", "info"];
const ICON_CONTENTS = {
    error: errorIconMarkup(),
    warning: warningIconMarkup(),
    success: successIconMarkup(),
};
/*
 * Set the warning, error, success or info icons:
 */
const initPredefinedIcon = (type, iconEl) => {
    const iconTypeClass = `${CLASS_NAMES.ICON}--${type}`;
    iconEl.classList.add(iconTypeClass);
    const iconContent = ICON_CONTENTS[type];
    if (iconContent) {
        iconEl.innerHTML = iconContent;
    }
};
const initImageURL = (url, iconEl) => {
    iconEl.classList.add(CLASS_NAMES.ICON_CUSTOM);
    let img = document.createElement('img');
    img.src = url;
    iconEl.appendChild(img);
};
const initIcon = (str) => {
    if (!str)
        return;
    let iconEl = injectElIntoModal(iconMarkup);
    if (PREDEFINED_ICONS.includes(str)) {
        initPredefinedIcon(str, iconEl);
    }
    else {
        initImageURL(str, iconEl);
    }
};

/*
 * Fixes a weird bug that doesn't wrap long text in modal
 * This is visible in the Safari browser for example.
 * https://stackoverflow.com/a/3485654/2679245
 */
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
            if (index < array.length - 1) {
                textNode.appendChild(document.createElement('br'));
            }
        });
        const textEl = injectElIntoModal(textMarkup);
        textEl.appendChild(textNode);
        webkitRerender(textEl);
    }
};

const CONFIRM_KEY = 'confirm';
const CANCEL_KEY = 'cancel';
const defaultButton = {
    visible: true,
    text: null,
    value: null,
    className: '',
    closeModal: true,
};
const defaultCancelButton = Object.assign({}, defaultButton, {
    visible: false,
    text: "Cancel",
    value: null,
});
const defaultConfirmButton = Object.assign({}, defaultButton, {
    text: "OK",
    value: true,
});
const defaultButtonList = {
    cancel: defaultCancelButton,
    confirm: defaultConfirmButton,
};
const getDefaultButton = (key) => {
    switch (key) {
        case CONFIRM_KEY:
            return defaultConfirmButton;
        case CANCEL_KEY:
            return defaultCancelButton;
        default:
            // Capitalize:
            const text = key.charAt(0).toUpperCase() + key.slice(1);
            return Object.assign({}, defaultButton, {
                text,
                value: key,
            });
    }
};
const normalizeButton = (key, param) => {
    const button = getDefaultButton(key);
    /*
     * Use the default button + make it visible
     */
    if (param === true) {
        return Object.assign({}, button, {
            visible: true,
        });
    }
    /* Set the text of the button: */
    if (typeof param === "string") {
        return Object.assign({}, button, {
            visible: true,
            text: param,
        });
    }
    /* A specified button should always be visible,
     * unless "visible" is explicitly set to "false"
     */
    if (isPlainObject(param)) {
        return Object.assign({
            visible: true,
        }, button, param);
    }
    return Object.assign({}, button, {
        visible: false,
    });
};
const normalizeButtonListObj = (obj) => {
    let buttons = {};
    for (let key of Object.keys(obj)) {
        const opts = obj[key];
        const button = normalizeButton(key, opts);
        buttons[key] = button;
    }
    /*
     * We always need a cancel action,
     * even if the button isn't visible
     */
    if (!buttons.cancel) {
        buttons.cancel = defaultCancelButton;
    }
    return buttons;
};
const normalizeButtonArray = (arr) => {
    let buttonListObj = {};
    switch (arr.length) {
        /* input: ["Accept"]
         * result: only set the confirm button text to "Accept"
         */
        case 1:
            buttonListObj[CANCEL_KEY] = Object.assign({}, defaultCancelButton, {
                visible: false,
            });
            break;
        /* input: ["No", "Ok!"]
         * result: Set cancel button to "No", and confirm to "Ok!"
         */
        case 2:
            buttonListObj[CANCEL_KEY] = normalizeButton(CANCEL_KEY, arr[0]);
            buttonListObj[CONFIRM_KEY] = normalizeButton(CONFIRM_KEY, arr[1]);
            break;
        default:
            throwErr(`Invalid number of 'buttons' in array (${arr.length}).
      If you want more than 2 buttons, you need to use an object!`);
    }
    return buttonListObj;
};
const getButtonListOpts = (opts) => {
    let buttonListObj = defaultButtonList;
    if (typeof opts === "string") {
        buttonListObj[CONFIRM_KEY] = normalizeButton(CONFIRM_KEY, opts);
    }
    else if (Array.isArray(opts)) {
        buttonListObj = normalizeButtonArray(opts);
    }
    else if (isPlainObject(opts)) {
        buttonListObj = normalizeButtonListObj(opts);
    }
    else if (opts === true) {
        buttonListObj = normalizeButtonArray([true, true]);
    }
    else if (opts === false) {
        buttonListObj = normalizeButtonArray([false, false]);
    }
    else if (opts === undefined) {
        buttonListObj = defaultButtonList;
    }
    return buttonListObj;
};

const defaultState = {
    isOpen: false,
    promise: null,
    actions: {},
    timer: null,
};
let state = Object.assign({}, defaultState);
/*
 * Change what the promise resolves to when the user clicks the button.
 * This is called internally when using { input: true } for example.
 */
const setActionValue = (opts) => {
    if (typeof opts === "string") {
        return setActionValueForButton(CONFIRM_KEY, opts);
    }
    for (let namespace in opts) {
        setActionValueForButton(namespace, opts[namespace]);
    }
};
const setActionValueForButton = (namespace, value) => {
    if (!state.actions[namespace]) {
        state.actions[namespace] = {};
    }
    Object.assign(state.actions[namespace], {
        value,
    });
};
/*
 * Sets other button options, e.g.
 * whether the button should close the modal or not
 */
const setActionOptionsFor = (buttonKey, { closeModal = true, } = {}) => {
    Object.assign(state.actions[buttonKey], {
        closeModal,
    });
};

const { OVERLAY: OVERLAY$2, SHOW_MODAL, BUTTON: BUTTON$2, BUTTON_LOADING, } = CLASS_NAMES;
const openModal = () => {
    let overlay = getNode(OVERLAY$2);
    overlay.classList.add(SHOW_MODAL);
    state.isOpen = true;
};
const hideModal = () => {
    let overlay = getNode(OVERLAY$2);
    overlay.classList.remove(SHOW_MODAL);
    state.isOpen = false;
};
/*
 * Triggers when the user presses any button, or
 * hits Enter inside the input:
 */
const onAction = (namespace = CANCEL_KEY) => {
    const { value, closeModal } = state.actions[namespace];
    if (closeModal === false) {
        const buttonClass = `${BUTTON$2}--${namespace}`;
        const button = getNode(buttonClass);
        button.classList.add(BUTTON_LOADING);
    }
    else {
        hideModal();
    }
    state.promise.resolve(value);
};
/*
 * Filter the state object. Remove the stuff
 * that's only for internal use
 */
const getState = () => {
    const publicState = Object.assign({}, state);
    delete publicState.promise;
    delete publicState.timer;
    return publicState;
};
/*
 * Stop showing loading animation on button
 * (to display error message in input for example)
 */
const stopLoading = () => {
    const buttons = document.querySelectorAll(`.${BUTTON$2}`);
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.classList.remove(BUTTON_LOADING);
    }
};

/*
 * Generate a button, with a container element,
 * the right class names, the text, and an event listener.
 * IMPORTANT: This will also add the button's action, which can be triggered even if the button element itself isn't added to the modal.
 */
const getButton = (namespace, { text, value, className, closeModal, }, dangerMode) => {
    const buttonContainer = stringToNode(buttonMarkup);
    const buttonEl = buttonContainer.querySelector(`.${CLASS_NAMES.BUTTON}`);
    const btnNamespaceClass = `${CLASS_NAMES.BUTTON}--${namespace}`;
    buttonEl.classList.add(btnNamespaceClass);
    if (className) {
        const classNameArray = Array.isArray(className)
            ? className
            : className.split(' ');
        classNameArray
            .filter(name => name.length > 0)
            .forEach(name => {
                buttonEl.classList.add(name);
            });
    }
    if (dangerMode && namespace === CONFIRM_KEY) {
        buttonEl.classList.add(CLASS_NAMES.DANGER_BUTTON);
    }
    buttonEl.textContent = text;
    let actionValues = {};
    actionValues[namespace] = value;
    setActionValue(actionValues);
    setActionOptionsFor(namespace, {
        closeModal,
    });
    buttonEl.addEventListener('click', () => {
        return onAction(namespace);
    });
    return buttonContainer;
};
/*
 * Create the buttons-container,
 * then loop through the ButtonList object
 * and append every button to it.
 */
const initButtons = (buttons, dangerMode) => {
    const footerEl = injectElIntoModal(footerMarkup);
    for (let key in buttons) {
        const buttonOpts = buttons[key];
        const buttonEl = getButton(key, buttonOpts, dangerMode);
        if (buttonOpts.visible) {
            footerEl.appendChild(buttonEl);
        }
    }
    /*
     * If the footer has no buttons, there's no
     * point in keeping it:
     */
    if (footerEl.children.length === 0) {
        footerEl.remove();
    }
};

/*
 * Add an <input> to the content container.
 * Update the "promised" value of the confirm button whenever
 * the user types into the input (+ make it "" by default)
 * Set the default focus on the input.
 */
const addInputEvents = (input) => {
    input.addEventListener('input', (e) => {
        const target = e.target;
        const text = target.value;
        setActionValue(text);
    });
    input.addEventListener('keyup', (e) => {
        if (e.key === "Enter") {
            return onAction(CONFIRM_KEY);
        }
    });
    /*
     * FIXME (this is a bit hacky)
     * We're overwriting the default value of confirm button,
     * as well as overwriting the default focus on the button
     */
    setTimeout(() => {
        input.focus();
        setActionValue('');
    }, 0);
};
const initPredefinedContent = (content, elName, attrs) => {
    const el = document.createElement(elName);
    const elClass = `${CLASS_NAMES.CONTENT}__${elName}`;
    el.classList.add(elClass);
    // Set things like "placeholder":
    for (let key in attrs) {
        let value = attrs[key];
        el[key] = value;
    }
    if (elName === "input") {
        addInputEvents(el);
    }
    content.appendChild(el);
};
const initContent = (opts) => {
    if (!opts)
        return;
    const content = injectElIntoModal(contentMarkup);
    const { element, attributes } = opts;
    if (typeof element === "string") {
        initPredefinedContent(content, element, attributes);
    }
    else {
        content.appendChild(element);
    }
};

const injectElIntoModal = (markup) => {
    const modal = getNode(CLASS_NAMES.MODAL);
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
    const modal = getNode(CLASS_NAMES.MODAL);
    customizeModalElement(modal, opts);
    initIcon(opts.icon);
    initTitle(opts.title);
    initText(opts.text);
    initContent(opts.content);
    initButtons(opts.buttons, opts.dangerMode);
};
const initModalOnce = () => {
    const overlay = getNode(CLASS_NAMES.OVERLAY);
    const modal = stringToNode(modalMarkup);
    overlay.appendChild(modal);
};

const initOverlayOnce = () => {
    document.body.appendChild(stringToNode(overlay));
};

const onTabAwayLastButton = (e) => {
    e.preventDefault();
    setFirstButtonFocus();
};
const onTabBackFirstButton = (e) => {
    e.preventDefault();
    setLastButtonFocus();
};
const onKeyUp = (e) => {
    if (!state.isOpen)
        return;
    switch (e.key) {
        case "Escape": return onAction(CANCEL_KEY);
    }
};
const onKeyDownLastButton = (e) => {
    if (!state.isOpen)
        return;
    switch (e.key) {
        case "Tab": return onTabAwayLastButton(e);
    }
};
const onKeyDownFirstButton = (e) => {
    if (!state.isOpen)
        return;
    if (e.key === "Tab" && e.shiftKey) {
        return onTabBackFirstButton(e);
    }
};
/*
 * Set default focus on Confirm-button
 */
const setFirstButtonFocus = () => {
    const button = getNode(CLASS_NAMES.BUTTON);
    if (button) {
        button.tabIndex = 0;
        button.focus();
    }
};
const setLastButtonFocus = () => {
    const modal = getNode(CLASS_NAMES.MODAL);
    const buttons = modal.querySelectorAll(`.${CLASS_NAMES.BUTTON}`);
    const lastIndex = buttons.length - 1;
    const lastButton = buttons[lastIndex];
    if (lastButton) {
        lastButton.focus();
    }
};
const setTabbingForLastButton = (buttons) => {
    const lastIndex = buttons.length - 1;
    const lastButton = buttons[lastIndex];
    lastButton.addEventListener('keydown', onKeyDownLastButton);
};
const setTabbingForFirstButton = (buttons) => {
    const firstButton = buttons[0];
    firstButton.addEventListener('keydown', onKeyDownFirstButton);
};
const setButtonTabbing = () => {
    const modal = getNode(CLASS_NAMES.MODAL);
    const buttons = modal.querySelectorAll(`.${CLASS_NAMES.BUTTON}`);
    if (!buttons.length)
        return;
    setTabbingForLastButton(buttons);
    setTabbingForFirstButton(buttons);
};
const onOutsideClick = (e) => {
    const overlay = getNode(CLASS_NAMES.OVERLAY);
    // Don't trigger for children:
    if (overlay !== e.target)
        return;
    return onAction(CANCEL_KEY);
};
const setClickOutside = (allow) => {
    const overlay = getNode(CLASS_NAMES.OVERLAY);
    overlay.removeEventListener('click', onOutsideClick);
    if (allow) {
        overlay.addEventListener('click', onOutsideClick);
    }
};
const setTimer = (ms) => {
    if (state.timer) {
        clearTimeout(state.timer);
    }
    if (ms) {
        state.timer = window.setTimeout(() => {
            return onAction(CANCEL_KEY);
        }, ms);
    }
};
const addEventListeners = (opts) => {
    if (opts.closeOnEsc) {
        document.addEventListener('keyup', onKeyUp);
    }
    else {
        document.removeEventListener('keyup', onKeyUp);
    }
    /* So that you don't accidentally confirm something
     * dangerous by clicking enter
     */
    if (opts.dangerMode) {
        setFirstButtonFocus();
    }
    else {
        setLastButtonFocus();
    }
    setButtonTabbing();
    setClickOutside(opts.closeOnClickOutside);
    setTimer(opts.timer);
};

/*
 * Inject modal and overlay into the DOM
 * Then format the modal according to the given opts
 */
const init = (opts) => {
    const modal = getNode(CLASS_NAMES.MODAL);
    if (!modal) {
        if (!document.body) throwErr("You can only use SweetAlert AFTER the DOM has loaded!");
        initOverlayOnce();
        initModalOnce();
    }
    initModalContent(opts);
    addEventListeners(opts);
};

const defaultInputOptions = {
    element: 'input',
    attributes: {
        placeholder: "",
    },
};
const getContentOpts = (contentParam) => {
    let opts = {};
    if (isPlainObject(contentParam)) {
        return Object.assign(opts, contentParam);
    }
    if (contentParam instanceof Element) {
        return {
            element: contentParam,
        };
    }
    if (contentParam === 'input') {
        return defaultInputOptions;
    }
    return null;
};

/*
 * A list of all the deprecated options from SweetAlert 1.X
 * These should log a warning telling users how to upgrade.
 */
const logDeprecation = (name) => {
    const details = DEPRECATED_OPTS[name];
    const { onlyRename, replacement, subOption, link } = details;
    const destiny = (onlyRename) ? 'renamed' : 'deprecated';
    let message = `SweetAlert warning: "${name}" option has been ${destiny}.`;
    if (replacement) {
        const subOptionText = (subOption) ? ` "${subOption}" in ` : ' ';
        message += ` Please use${subOptionText}"${replacement}" instead.`;
    }
    const DOMAIN = 'https://sweetalert.js.org';
    if (link) {
        message += ` More details: ${DOMAIN}${link}`;
    }
    else {
        message += ` More details: ${DOMAIN}/guides/#upgrading-from-1x`;
    }
    console.warn(message);
};
const DEPRECATED_OPTS = {
    'type': {
        replacement: 'icon',
        link: '/docs/#icon',
    },
    'imageUrl': {
        replacement: 'icon',
        link: '/docs/#icon',
    },
    'customClass': {
        replacement: 'className',
        onlyRename: true,
        link: '/docs/#classname',
    },
    'imageSize': {},
    'showCancelButton': {
        replacement: 'buttons',
        link: '/docs/#buttons',
    },
    'showConfirmButton': {
        replacement: 'button',
        link: '/docs/#button',
    },
    'confirmButtonText': {
        replacement: 'button',
        link: '/docs/#button',
    },
    'confirmButtonColor': {},
    'cancelButtonText': {
        replacement: 'buttons',
        link: '/docs/#buttons',
    },
    'closeOnConfirm': {
        replacement: 'button',
        subOption: 'closeModal',
        link: '/docs/#button',
    },
    'closeOnCancel': {
        replacement: 'buttons',
        subOption: 'closeModal',
        link: '/docs/#buttons',
    },
    'showLoaderOnConfirm': {
        replacement: 'buttons',
    },
    'animation': {},
    'inputType': {
        replacement: 'content',
        link: '/docs/#content',
    },
    'inputValue': {
        replacement: 'content',
        link: '/docs/#content',
    },
    'inputPlaceholder': {
        replacement: 'content',
        link: '/docs/#content',
    },
    'html': {
        replacement: 'content',
        link: '/docs/#content',
    },
    'allowEscapeKey': {
        replacement: 'closeOnEsc',
        onlyRename: true,
        link: '/docs/#closeonesc',
    },
    'allowClickOutside': {
        replacement: 'closeOnClickOutside',
        onlyRename: true,
        link: '/docs/#closeonclickoutside',
    },
};

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
/*
 * Default options customizeable through "setDefaults":
 */
let userDefaults = Object.assign({}, defaultOpts);
const setDefaults = (opts) => {
    userDefaults = Object.assign({}, defaultOpts, opts);
};
/*
 * Since the user can set both "button" and "buttons",
 * we need to make sure we pick one of the options
 */
const pickButtonParam = (opts) => {
    const singleButton = opts && opts.button;
    const buttonList = opts && opts.buttons;
    if (singleButton !== undefined && buttonList !== undefined) {
        throwErr(`Cannot set both 'button' and 'buttons' options!`);
    }
    if (singleButton !== undefined) {
        return {
            confirm: singleButton,
        };
    }
    else {
        return buttonList;
    }
};
// Example 0 -> 1st
const indexToOrdinal = (index) => ordinalSuffixOf(index + 1);
const invalidParam = (param, index) => {
    throwErr(`${indexToOrdinal(index)} argument ('${param}') is invalid`);
};
const expectOptionsOrNothingAfter = (index, allParams) => {
    let nextIndex = (index + 1);
    let nextParam = allParams[nextIndex];
    if (!isPlainObject(nextParam) && nextParam !== undefined) {
        throwErr(`Expected ${indexToOrdinal(nextIndex)} argument ('${nextParam}') to be a plain object`);
    }
};
const expectNothingAfter = (index, allParams) => {
    let nextIndex = (index + 1);
    let nextParam = allParams[nextIndex];
    if (nextParam !== undefined) {
        throwErr(`Unexpected ${indexToOrdinal(nextIndex)} argument (${nextParam})`);
    }
};
/*
 * Based on the number of arguments, their position and their type,
 * we return an object that's merged into the final SwalOptions
 */
const paramToOption = (opts, param, index, allParams) => {
    const paramType = (typeof param);
    const isString = (paramType === "string");
    const isDOMNode = (param instanceof Element);
    if (isString) {
        if (index === 0) {
            // Example: swal("Hi there!");
            return {
                text: param,
            };
        }
        else if (index === 1) {
            // Example: swal("Wait!", "Are you sure you want to do this?");
            // (The text is now the second argument)
            return {
                text: param,
                title: allParams[0],
            };
        }
        else if (index === 2) {
            // Example: swal("Wait!", "Are you sure?", "warning");
            expectOptionsOrNothingAfter(index, allParams);
            return {
                icon: param,
            };
        }
        else {
            invalidParam(param, index);
        }
    }
    else if (isDOMNode && index === 0) {
        // Example: swal(<DOMNode />);
        expectOptionsOrNothingAfter(index, allParams);
        return {
            content: param,
        };
    }
    else if (isPlainObject(param)) {
        expectNothingAfter(index, allParams);
        return param;
    }
    else {
        invalidParam(param, index);
    }
};
/*
 * No matter if the user calls swal with
 * - swal("Oops!", "An error occurred!", "error") or
 * - swal({ title: "Oops!", text: "An error occurred!", icon: "error" })
 * ... we always want to transform the params into the second version
 */
const getOpts = (...params) => {
    let opts = {};
    params.forEach((param, index) => {
        let changes = paramToOption(opts, param, index, params);
        Object.assign(opts, changes);
    });
    // Since Object.assign doesn't deep clone,
    // we need to do this:
    let buttonListOpts = pickButtonParam(opts);
    opts.buttons = getButtonListOpts(buttonListOpts);
    delete opts.button;
    opts.content = getContentOpts(opts.content);
    const finalOptions = Object.assign({}, defaultOpts, userDefaults, opts);
    // Check if the users uses any deprecated options:
    Object.keys(finalOptions).forEach(optionName => {
        if (DEPRECATED_OPTS[optionName]) {
            logDeprecation(optionName);
        }
    });
    return finalOptions;
};

const swal = (...args) => {
    // Prevent library to be run in Node env:
    if (typeof window === 'undefined')
        return;
    const opts = getOpts(...args);
    return new Promise((resolve, reject) => {
        state.promise = { resolve, reject };
        init(opts);
        // For fade animation to work:
        setTimeout(() => {
            openModal();
        });
    });
};
swal.close = onAction;
swal.getState = getState;
swal.setActionValue = setActionValue;
swal.stopLoading = stopLoading;
swal.setDefaults = setDefaults;

const alertFeature = () => {
    document.adoptedStyleSheets = [alert_namespaceObject["default"]];
}


/***/ })

}]);