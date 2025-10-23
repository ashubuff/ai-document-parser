var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** ModelEnum
 *
 */
var ModelEnum;
(function (ModelEnum) {
    ModelEnum["OPENAI_GPT_4_TURBO"] = "openai_gpt-4-turbo";
    ModelEnum["OPENAP_GPT_4o"] = "openai_gpt-4o";
    ModelEnum["OPENAI_GPT_4"] = "openai_gpt-4";
    ModelEnum["OPENAI_GPT_3_5_TURBO"] = "openai_gpt-3.5-turbo";
    ModelEnum["BEDROCK_ANTHROPIC_CLAUDE_V2"] = "bedrock_anthropic.claude-v2";
    ModelEnum["BEDROCK_META_LLAMA3_70B"] = "bedrock_meta.llama3-70b-instruct-v1:0";
    ModelEnum["BEDROCK_META_LLAMA3_8B"] = "bedrock_meta.llama3-8b-instruct-v1:0";
    ModelEnum["BEDROCK_ANTHROPIC_CLAUDE_HAIKU"] = "bedrock_anthropic.claude-3-haiku-20240307-v1:0";
})(ModelEnum || (ModelEnum = {}));
/**
 * DocsToFields - Extracts fields from one or more documents. See {@link /examples.html} for usage examples.
 * @class DocsToFields
 * @example
 * // extract using single file input element
 * const settings = {
 *   authKey: 'key',
 *   url: 'https://.../',
 * };
 *
 * const docsToFields = new DocsToFields(settings);
 * docsToFields.addField({ name: 'name', description: 'Name of the person' });
 * docsToFields.addFile(document.getElementById('file').files[0]);
 *
 * docsToFields.getFields().then(fields => {
 *  console.log(fields);
 * // set state or update form fields
 * }).catch(error => {
 *  console.error(error);
 * });
 *
 *
 *  @example
 * const settings = {
 *    fileDropElement: document.getElementById('file-drop'),
 *   systemPrompt: 'You are a helpful assistant that extracts fields from documents.\nYou only output results in JSON only.',
 *   authKey: 'YOUR AUTH KEY'
 * }
 * const docsToFields = new DocsToFields(settings);
 * docsToFields.addField({ name: 'name', description: 'Name of the person' });
 * docsToFields.getFields().then(fields => {
 *   console.log(fields);
 *   // set state or update form fields
 * }).catch(error => {
 *  console.error(error);
 * });
 **/
class DocsToFields {
    /**
     * DocsToFields constructor
     * @param settings Settings for extracting fields from documents
     * @memberof DocsToFields
     * @constructor
     **/
    constructor(settings) {
        /**
         * Files to extract fields from - private use only - populated by {@link DocsToFields.addFile} method or {@link DocsToFields.fileExtractText} method
         */
        this.files = [];
        /**
         * Fields to extract - private use only - populated by settings or {@link DocsToFields.addField} method
         */
        this.fields = [];
        /**
         * Viewer window for viewing documents
         */
        this.viewerWindow = null;
        /**
         * Labels for classification of documents
         */
        this.labels = [];
        /**
         * Show fields in viewer window
         */
        this.showFields = true;
        /**
         * Send file to viewer window
         */
        this.sendFile = false;
        this.findValueOfProperty = (obj, propertyName) => {
            let reg = new RegExp(propertyName, "i"); // "i" to make it case insensitive
            const df = { fields: [] };
            const found = Object.keys(obj).reduce((result, key) => {
                if (reg.test(key))
                    result.push(obj[key]);
                return result;
            }, []);
            if (found.length > 0) {
                return found[0];
            }
            else {
                return df;
            }
        };
        this.settings = settings;
        console.log('this.settings',this.settings)
        this.fields = settings.fields || [];
        if (settings.fileDropElement) {
            settings.fileDropElement.addEventListener('drop', (event) => this.dropHandler(event));
            settings.fileDropElement.addEventListener('dragover', (event) => this.dragOverHandler(event));
            settings.fileDropElement.addEventListener('dragleave', (event) => this.dragLeaveHandler(event));
            settings.fileDropElement.addEventListener('dragenter', (event) => this.dragEnterHandler(event));
        }
        // if settings.url is not provided then use default from document.location
        if (!settings.url) {
            settings.url = this.getLocalUrl();
        }
        if (!settings.viewerUrl) {
            settings.viewerUrl = '/viewer';
        }
    }
    /**
     * Set auth key
     * @param authKey Docs to fields auth key
     */
    setAuthKey(authKey) {
        this.settings.authKey = authKey;
    }
    /**
     * Set llm system prompt
     * @param systemPrompt llm system prompt (Optional - default is used if not provided)
     */
    setSystemPrompt(systemPrompt) {
        this.settings.systemPrompt = systemPrompt;
    }
    /**
     * Set llm prompt
     * @param prompt llm prompt (Optional - default is used if not provided)
     */
    setPrompt(prompt) {
        this.settings.prompt = prompt;
    }
    /**
     * Set model to use for extracting fields
     * @param model Model to use for extracting fields - DEFAULTS to OPENAI_GPT_4_TURBO
     */
    setModel(model) {
        this.settings.model = model;
    }
    /** Set enable Textract for AWS to extract PDF, TIFF, PNG, JPG
     * @param enableTextract Enable Textract for AWS to extract PDF, TIFF, PNG, JPG
     * @example
     * docsToFields.setEnableTextract(true);
     */
    setEnableTextract(enableTextract) {
        this.settings.enableTextract = enableTextract;
    }
    // Set classifier prompt
    setClassifierPrompt(classifierPrompt) {
        this.settings.classifierPrompt = classifierPrompt;
    }
    /**
     * Set classifiers for classification of documents
     */
    setClassifiers(classifiers) {
        this.classifiers = classifiers;
        // get the keys and descriptions from the classifiers
        this.labels = Object.keys(classifiers).map(key => {
            return { name: key, description: classifiers[key].description };
        });
    }
    /**
     * Add field to extract from document (optional - use settings fields if provided)
     * @param field Field to extract
     * @example
     * docsToFields.addField({ name: 'name', description: 'Name of the person' });
     */
    addField(field) {
        this.fields.push(field);
    }
    /**
     * Clear fields to extract
     */
    clearFields() {
        this.fields = [];
    }
    /**
     * Clear files to extract
     */
    clearFiles() {
        this.files = [];
    }
    messageHandler(event, _self) {
        return __awaiter(this, void 0, void 0, function* () {
            let messageJson = {};
            try {
                messageJson = JSON.parse(event.data);
                console.log('Message:', messageJson);
            }
            catch (error) {
                // console.error('Failed to parse message:', error);
            }
            const source = messageJson.source;
            if (messageJson.init && source == 'doc2fields-viewer') {
                if (_self.viewerWindow) {
                    //show fields in viewer window
                    _self.viewerWindow.postMessage(JSON.stringify({
                        type: 'showFields',
                        showFields: _self.showFields,
                        source: 'docstofields'
                    }), '*');
                    _self.viewerWindow.postMessage(JSON.stringify({
                        type: 'fields',
                        fields: _self.fields,
                        source: 'docstofields'
                    }), '*');
                    _self.viewerWindow.postMessage(JSON.stringify({
                        type: 'key',
                        key: _self.settings.authKey,
                        source: 'docstofields'
                    }), '*');
                    _self.viewerWindow.postMessage(JSON.stringify({
                        type: 'settings',
                        settings: {
                            model: _self.settings.model,
                            enableTextract: _self.settings.enableTextract || false,
                            prompt: _self.settings.prompt,
                            systemPrompt: _self.settings.systemPrompt,
                            classifierPrompt: _self.settings.classifierPrompt,
                            classifiers: _self.classifiers,
                        },
                        source: 'docstofields'
                    }), '*');
                    if (_self.files.length > 0 && _self.sendFile) {
                        const firstfile = _self.files.length > 0 ? _self.files[0] : null;
                        if (firstfile) {
                            // sendfile as base64
                            const base64File = yield _self.convertDocToBase64(firstfile.file);
                            _self.viewerWindow.postMessage(JSON.stringify({
                                type: 'file',
                                file: base64File,
                                source: 'docstofields'
                            }), '*');
                        }
                    }
                    // Send pending field values if they exist (for auto-open viewer)
                    if (_self.pendingFieldValues) {
                        const blocks = _self.files.length > 0 ? _self.files[0].blocks : [];
                        _self.viewerWindow.postMessage(JSON.stringify({
                            type: 'fieldValues',
                            fieldValues: _self.pendingFieldValues,
                            blocks: blocks,
                            source: 'docstofields'
                        }), '*');
                        _self.pendingFieldValues = null; // Clear after sending
                    }
                }
            }
            if (messageJson.extractedFields && source == 'doc2fields-viewer') {
                _self.extractedFields = messageJson.extractedFields;
                if (_self.viewFileCallback) {
                    _self.viewFileCallback({ fields: messageJson.extractedFields });
                }
            }
            if (messageJson.file && source == 'doc2fields-viewer') {
                // convert base64 to file
                const file = base64ToFile(messageJson.file);
                // if the file does not already exist then add it
                if (!_self.files.find(f => f.file.name === file.name)) {
                    _self.addFile(file, messageJson.text);
                    if (_self.viewFileCallback) {
                        _self.viewFileCallback({ file: file });
                    }
                }
            }
            if (messageJson.location && messageJson.source == 'doc2fields-viewer') {
                // save location in local storage
                localStorage.setItem('doc2fields-viewer-location', JSON.stringify(messageJson.location));
                // size
                localStorage.setItem('doc2fields-viewer-size', JSON.stringify(messageJson.size));
            }
        });
    }
    /**
     *  View file in viewer window
     */
    viewFile({ showFields, sendFile, callback }) {
        showFields = typeof showFields !== 'undefined' ? showFields : true;
        sendFile = typeof sendFile !== 'undefined' ? sendFile : false;
        this.viewFileCallback = callback;
        const { viewerUrl } = this.settings;
        this.showFields = showFields;
        this.sendFile = sendFile;
        if (!this.handlerFunc) {
            this.handlerFunc = (event) => this.messageHandler(event, this);
        }
        console.log(' this.viewerWindow', this.viewerWindow);
        // close existing viewer window if open
        if (this.viewerWindow) {
            this.viewerWindow.close();
            // remove message listener
            window.removeEventListener('message', this.handlerFunc, false);
            console.log('Closed viewer window');
            this.viewerWindow = null;
        }
        if (!this.viewerWindow) {
            // set features where window is 100% height and 75% width
            let targetWidth = window.screen.availWidth * .75;
            let targetHeight = window.screen.availHeight;
            let left = window.screenX + window.screen.availWidth - targetWidth;
            let top = window.screenY;
            // get location if saved in local storage
            const location = localStorage.getItem('doc2fields-viewer-location');
            if (location) {
                const loc = JSON.parse(location);
                left = loc.x;
                top = loc.y;
            }
            const size = localStorage.getItem('doc2fields-viewer-size');
            if (size) {
                const sz = JSON.parse(size);
                targetWidth = sz.width;
                targetHeight = sz.height;
            }
            const features = `width=${targetWidth},height=${targetHeight},left=${left},top=${top},location=no,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes`;
            this.viewerWindow = window.open(viewerUrl, "_blank", features);
            const _self = this;
            window.addEventListener('message', this.handlerFunc, false);
        }
        if (this.viewerWindow) {
            this.viewerWindow.focus();
        }
    }
    /**
     * Add file to extract fields from input file element.  Do not use if fileDropElement is provided in settings or
     * if you used {@link DocsToFields.fileExtractText} method to extract text from file.
     * @param file File object from input file or drag and drop target
     * @param text Text extracted from file (optional)
     * @example
     * const file = document.getElementById('file').files[0];
     * docsToFields.addFile(file);
     */
    addFile(file, text, blocks) {
        this.files.push({ file, text, blocks });
    }
    /**
     * Extract text from file and store as file object (same as calling addFile method)
     * @param file File object from input file or drag and drop target
     * @returns Promise<any> - Returns extracted text
     * @memberof DocsToFields
     * @method fileExtractText
     * @example
     * const file = document.getElementById('file').files[0];
     * docsToFields.fileExtractText(file).then(text => {
     *  console.log(text);
     *  // highlight file element as valid
     * }).catch(error => {
     *  console.error(error);
     *  // highlight file element as invalid
     * });
     */
    fileExtractText(file) {
        return new Promise((resolve, reject) => {
            if (this.settings.fileEvent) {
                this.settings.fileEvent('start', file);
            }
            const { url } = this.settings;
            this.convertDocToBase64(file).then((base64File) => {
                console.log(base64File);
                fetch(`${url}/extractText`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-key': this.settings.authKey,
                        'mode':'no-cors'
                    },
                    body: JSON.stringify({
                        file: base64File,
                        enableTextract: this.settings.enableTextract || false
                    })
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    if (this.settings.fileEvent) {
                        this.settings.fileEvent('error');
                    }
                    throw new Error('Error extracting text');
                }).then(json => {
                    /// if json.text is json then pass it to resolve
                    if (json.hasOwnProperty('text')) {
                        this.addFile(file, json.text, json.blocks);
                        if (this.settings.fileEvent) {
                            this.settings.fileEvent('done', file);
                        }
                        // throw error if text is empty based on regex
                        if (json.text.match(/^\s*$/)) {
                            reject('No text extracted from file');
                        }
                        else {
                            resolve(json.text);
                        }
                    }
                    else {
                        resolve(json);
                    }
                }).catch(error => {
                    reject(error);
                    if (this.settings.fileEvent) {
                        this.settings.fileEvent('error');
                    }
                });
            }).catch((error) => {
                reject(error);
                if (this.settings.fileEvent) {
                    this.settings.fileEvent('error');
                }
            });
        });
    }
    /**
     * Extract fields from documents
     * @returns Promise<any> - Returns extracted fields as json
     * @memberof DocsToFields
     * @method getFields
     * @example
     * docsToFields.addField({ name: 'name', description: 'Name of the person' });
     * docsToFields.addFile(file);
     * docsToFields.getFields().then(fields => {
     *  console.log(fields);
     * // set state or update form fields
     * }).catch(error => {
     *  console.error(error);
     * });
     */
    getFields() {
        let { prompt } = this.settings;
        // set default prompt if not provided
        if (!prompt) {
            prompt = `Documents:
                    {input_documents}

                    Extract the following fields from the document:
                    {fields}

                    Results in JSON only`;
        }
        return this.process(prompt).then((json) => {
            // Store extracted fields for viewer
            this.extractedFields = json;
            
            /// message viewWindow to update field list
            if (this.viewerWindow) {
                // get blocks from first file
                const blocks = this.files.length > 0 ? this.files[0].blocks : [];
                this.viewerWindow.postMessage(JSON.stringify({
                    type: 'fieldValues',
                    fieldValues: json,
                    blocks: blocks,
                    source: 'docstofields'
                }), '*');
            } else if (this.settings.autoOpenViewer && this.files.length > 0) {
                // Automatically open viewer after extraction if configured
                // Store extracted values to send when viewer initializes
                this.pendingFieldValues = json;
                this.viewFile({
                    showFields: true,
                    sendFile: true,
                    callback: this.settings.viewerCallback || (() => {})
                });
            }
            return json;
        });
    }
    /**
     * Get the current files
     * @returns Current files
     */
    getFiles() {
        return this.files;
    }
    
    classify() {
        let { classifierPrompt } = this.settings;
        if (!classifierPrompt) {
            classifierPrompt = `Documents:
                                {input_documents}

                                Classify the document with one of the following labels:
                                {labels}

                                Result as document_label in JSON.`;
        }
        return this.process(this.settings.classifierPrompt, true).then((json) => {
            console.log('Classifier:', json);
            console.log('Classifiers:', this.classifiers);
            // if has document_label then return matching classifier
            if (json.hasOwnProperty('document_label')) {
                return Object.assign(Object.assign({}, this.findValueOfProperty(this.classifiers, json.document_label)), { label: json.document_label });
            }
            return { fields: [], label: 'Not found' };
        });
    }
    /**
     * Process ai prompt on documents
     * @param prompt Prompt to process
     * @returns Promise<any> - Returns extracted fields as json
     * @memberof DocsToFields
     * @method process
     */
    process(prompt, classify = false) {
        return new Promise((resolve, reject) => {
            // check for fields if not throw error  
            if (!classify && this.fields.length === 0) {
                reject('No fields to extract - Specify one field');
            }
            let { systemPrompt, url, model } = this.settings;
            // set default systemPrompt if not provided
            if (!systemPrompt) {
                systemPrompt = 'You are a helpful assistant that extracts fields from documents.\nYou only output results in JSON only.';
            }
            const promises = this.files.map(file => new Promise((resolve, reject) => {
                if (file.text) {
                    resolve({ name: file.file.name, text: file.text });
                }
                else {
                    this.convertDocToBase64(file.file).then((base64File) => resolve(base64File)).catch((error) => reject(error));
                }
            }));
            Promise.all(promises).then(base64Files => {
                fetch(`${url}/extract`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-key': this.settings.authKey,
                        'mode':'no-cors'
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        systemPrompt: systemPrompt,
                        fields: classify ? [] : this.fields,
                        files: base64Files,
                        labels: classify ? this.labels : [],
                        model: model,
                        enableTextract: this.settings.enableTextract || false,
                        aiConfig: this.settings.aiConfig || null
                    })
                }).then((response) => __awaiter(this, void 0, void 0, function* () {
                    if (response.ok) {
                        const json = yield response.json();
                        // if json has files update files with text
                        if (json.hasOwnProperty('files')) {
                            this.files = json.files.map((file, index) => {
                                return { file: this.files[index].file, text: file.text, blocks: file.blocks || this.files[index].blocks };
                            });
                        }
                        /// if json.text is json then pass it to resolve
                        if (json.hasOwnProperty('text')) {
                            resolve(JSON.parse(json.text));
                        }
                        else {
                            resolve(json);
                        }
                    }
                    else {
                        reject('Error extracting fields');
                    }
                })).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    /**
     * Convert document to base64
     * @param file File object from input file or drag and drop target
     * @returns Promise<Base64File> - Returns base64 encoded file
     * @memberof DocsToFields
     * @method convertDocToBase64
     **/
    convertDocToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({ name: file.name, base64: reader.result });
            };
            reader.onerror = () => {
                reject('Error reading file');
            };
            reader.readAsDataURL(file);
        });
    }
    updateFileList() {
        // in the fileDropElement add a list of files
        if (this.settings.fileListElement) {
            this.settings.fileListElement.innerHTML = '';
            this.files.forEach(file => {
                const li = document.createElement('li');
                li.textContent = file.file.name;
                // add dropfile class name
                li.className = 'dropfile';
                // add valid class name with valid file
                if (file.text) {
                    li.className += ' valid';
                }
                else {
                    li.className += ' invalid';
                }
                // add button to remove file
                const button = document.createElement('button');
                button.textContent = 'Remove';
                button.onclick = () => {
                    this.files = this.files.filter(f => f !== file);
                    this.updateFileList();
                };
                button.className = 'dropfile-remove';
                li.appendChild(button);
                this.settings.fileListElement.appendChild(li);
            });
        }
    }
    dropHandler(event) {
        event.preventDefault();
        // clear extracted fields from view window
        this.extractedFields = null;
        if (this.settings.fileDropElement) {
            this.settings.fileDropElement.className = this.settings.fileDropElement.className.replace('docstofields-dragover', '');
        }
        if (event.dataTransfer.items) {
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (event.dataTransfer.items[i].kind === 'file') {
                    const file = event.dataTransfer.items[i].getAsFile();
                    this.fileExtractText(file).then(() => {
                        this.updateFileList();
                    }).catch(error => {
                        this.updateFileList();
                    });
                }
            }
        }
        else {
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                this.fileExtractText(event.dataTransfer.files[i]).then(() => {
                    this.updateFileList();
                }).catch(error => {
                    this.updateFileList();
                });
            }
        }
    }
    dragOverHandler(event) {
        event.preventDefault();
    }
    dragLeaveHandler(event) {
        // remove the class to doctofields-dragover
        if (this.settings.fileDropElement) {
            this.settings.fileDropElement.className = this.settings.fileDropElement.className.replace('docstofields-dragover', '');
        }
    }
    dragEnterHandler(event) {
        if (this.settings.fileDropElement) {
            this.settings.fileDropElement.className += ' docstofields-dragover';
        }
    }
    getLocalUrl() {
        const { protocol, hostname, port } = window.location;
        return `${protocol}//${hostname}:${port}`;
    }
}
/**
 * Converts Base64File to File object
 * @param base64File Base64File to convert to File
 * @returns
 */
const base64ToFile = (base64File) => {
    const f = base64File;
    const base64EncodedFile = f.base64;
    const base64Data = base64EncodedFile.replace(/^data:.*?;base64,/, '');
    const match = base64EncodedFile.match(/^data:(.*?);base64,/);
    const mime = match ? match[1] : '';
    const binaryString = atob(base64Data);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new File([bytes.buffer], f.name, { type: mime });
};

// Also export to window for non-module usage
if (typeof window !== 'undefined') {
    window.DocsToFields = DocsToFields;
    window.ModelEnum = ModelEnum;
    window.base64ToFile = base64ToFile;
}