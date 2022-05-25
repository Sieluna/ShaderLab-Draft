"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[854],{

/***/ 854:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "editor": () => (/* binding */ editor),
  "flowFeature": () => (/* binding */ flowFeature),
  "prefabs": () => (/* binding */ prefabs),
  "structure": () => (/* reexport */ structure)
});

;// CONCATENATED MODULE: ./sys/public/js/flow/drawflow.js
class Drawflow {
    constructor(container, render = null, parent = null) {
        this.events = {};
        this.container = container;
        this.precanvas = null;
        this.nodeId = 1;
        this.ele_selected = null;
        this.node_selected = null;
        this.drag = false;
        this.reroute = false;
        this.reroute_fix_curvature = false;
        this.curvature = 0.5;
        this.reroute_curvature_start_end = 0.5;
        this.reroute_curvature = 0.5;
        this.reroute_width = 6;
        this.drag_point = false;
        this.editor_selected = false;
        this.connection = false;
        this.connection_ele = null;
        this.connection_selected = null;
        this.canvas_x = 0;
        this.canvas_y = 0;
        this.pos_x = 0;
        this.pos_x_start = 0;
        this.pos_y = 0;
        this.pos_y_start = 0;
        this.mouse_x = 0;
        this.mouse_y = 0;
        this.line_path = 5;
        this.first_click = null;
        this.force_first_input = false;
        this.draggable_inputs = true;
        this.useuuid = false;
        this.parent = parent;

        this.noderegister = {};
        this.render = render;
        this.drawflow = { "drawflow": { "Home": { "data": {} }}};
        // Configurable options
        this.module = 'Home';
        this.editor_mode = 'edit';
        this.zoom = 1;
        this.zoom_max = 1.6;
        this.zoom_min = 0.5;
        this.zoom_value = 0.1;
        this.zoom_last_value = 1;

        // Mobile
        this.evCache = new Array();
        this.prevDiff = -1;
    }

    start () {
        // console.info("Start Drawflow!!");
        this.container.classList.add("parent-drawflow");
        this.container.tabIndex = 0;
        this.precanvas = document.createElement('div');
        this.precanvas.classList.add("drawflow");
        this.container.appendChild(this.precanvas);

        /* Mouse and Touch Actions */
        this.container.addEventListener('mouseup', this.dragEnd.bind(this));
        this.container.addEventListener('mousemove', this.position.bind(this));
        this.container.addEventListener('mousedown', this.click.bind(this) );

        this.container.addEventListener('touchend', this.dragEnd.bind(this));
        this.container.addEventListener('touchmove', this.position.bind(this));
        this.container.addEventListener('touchstart', this.click.bind(this));

        /* Context Menu */
        this.container.addEventListener('contextmenu', this.contextmenu.bind(this));
        /* Delete */
        this.container.addEventListener('keydown', this.key.bind(this));

        /* Zoom Mouse */
        this.container.addEventListener('wheel', this.zoom_enter.bind(this));
        /* Update data Nodes */
        this.container.addEventListener('input', this.updateNodeValue.bind(this));

        this.container.addEventListener('dblclick', this.dblclick.bind(this));
        /* Mobile zoom */
        this.container.onpointerdown = this.pointerdown_handler.bind(this);
        this.container.onpointermove = this.pointermove_handler.bind(this);
        this.container.onpointerup = this.pointerup_handler.bind(this);
        this.container.onpointercancel = this.pointerup_handler.bind(this);
        this.container.onpointerout = this.pointerup_handler.bind(this);
        this.container.onpointerleave = this.pointerup_handler.bind(this);

        this.load();
    }

    /* Mobile zoom */
    pointerdown_handler(ev) {
        this.evCache.push(ev);
    }

    pointermove_handler(ev) {
        for (var i = 0; i < this.evCache.length; i++) {
            if (ev.pointerId == this.evCache[i].pointerId) {
                this.evCache[i] = ev;
                break;
            }
        }

        if (this.evCache.length == 2) {
            // Calculate the distance between the two pointers
            var curDiff = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);

            if (this.prevDiff > 100) {
                if (curDiff > this.prevDiff) {
                    // The distance between the two pointers has increased

                    this.zoom_in();
                }
                if (curDiff < this.prevDiff) {
                    // The distance between the two pointers has decreased
                    this.zoom_out();
                }
            }
            this.prevDiff = curDiff;
        }
    }

    pointerup_handler(ev) {
        this.remove_event(ev);
        if (this.evCache.length < 2) {
            this.prevDiff = -1;
        }
    }
    remove_event(ev) {
        // Remove this event from the target's cache
        for (var i = 0; i < this.evCache.length; i++) {
            if (this.evCache[i].pointerId == ev.pointerId) {
                this.evCache.splice(i, 1);
                break;
            }
        }
    }
    /* End Mobile Zoom */
    load() {
        for (var key in this.drawflow.drawflow[this.module].data) {
            this.addNodeImport(this.drawflow.drawflow[this.module].data[key], this.precanvas);
        }

        if(this.reroute) {
            for (var key in this.drawflow.drawflow[this.module].data) {
                this.addRerouteImport(this.drawflow.drawflow[this.module].data[key]);
            }
        }

        for (var key in this.drawflow.drawflow[this.module].data) {
            this.updateConnectionNodes('node-'+key);
        }

        const editor = this.drawflow.drawflow;
        let number = 1;
        Object.keys(editor).map(function(moduleName, index) {
            Object.keys(editor[moduleName].data).map(function(id, index2) {
                if(parseInt(id) >= number) {
                    number = parseInt(id)+1;
                }
            });
        });
        this.nodeId = number;
    }

    removeReouteConnectionSelected(){
        this.dispatch('connectionUnselected', true);
        if(this.reroute_fix_curvature) {
            this.connection_selected.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
                item.classList.remove("selected");
            });
        }
    }

    click(e) {
        this.dispatch('click', e);
        if(this.editor_mode === 'fixed') {
            //return false;
            e.preventDefault();
            if(e.target.classList[0] === 'parent-drawflow' || e.target.classList[0] === 'drawflow') {
                this.ele_selected = e.target.closest(".parent-drawflow");
            } else {
                return false;
            }
        } else if(this.editor_mode === 'view') {
            if(e.target.closest(".drawflow") != null || e.target.matches('.parent-drawflow')) {
                this.ele_selected = e.target.closest(".parent-drawflow");
                e.preventDefault();
            }
        } else {
            this.first_click = e.target;
            this.ele_selected = e.target;
            if(e.button === 0) {
                this.contextmenuDel();
            }

            if(e.target.closest(".drawflow_content_node") != null) {
                this.ele_selected = e.target.closest(".drawflow_content_node").parentElement;
            }
        }
        switch (this.ele_selected.classList[0]) {
            case 'drawflow-node':
                if(this.node_selected != null) {
                    this.node_selected.classList.remove("selected");
                    if(this.node_selected != this.ele_selected) {
                        this.dispatch('nodeUnselected', true);
                    }
                }
                if(this.connection_selected != null) {
                    this.connection_selected.classList.remove("selected");
                    this.removeReouteConnectionSelected();
                    this.connection_selected = null;
                }
                if(this.node_selected != this.ele_selected) {
                    this.dispatch('nodeSelected', this.ele_selected.id.slice(5));
                }
                this.node_selected = this.ele_selected;
                this.node_selected.classList.add("selected");
                if(!this.draggable_inputs) {
                    if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT' && e.target.hasAttribute('contenteditable') !== true) {
                        this.drag = true;
                    }
                } else {
                    if(e.target.tagName !== 'SELECT') {
                        this.drag = true;
                    }
                }
                break;
            case 'output':
                this.connection = true;
                if(this.node_selected != null) {
                    this.node_selected.classList.remove("selected");
                    this.node_selected = null;
                    this.dispatch('nodeUnselected', true);
                }
                if(this.connection_selected != null) {
                    this.connection_selected.classList.remove("selected");
                    this.removeReouteConnectionSelected();
                    this.connection_selected = null;
                }
                this.drawConnection(e.target);
                break;
            case 'parent-drawflow':
                if(this.node_selected != null) {
                    this.node_selected.classList.remove("selected");
                    this.node_selected = null;
                    this.dispatch('nodeUnselected', true);
                }
                if(this.connection_selected != null) {
                    this.connection_selected.classList.remove("selected");
                    this.removeReouteConnectionSelected();
                    this.connection_selected = null;
                }
                this.editor_selected = true;
                break;
            case 'drawflow':
                if(this.node_selected != null) {
                    this.node_selected.classList.remove("selected");
                    this.node_selected = null;
                    this.dispatch('nodeUnselected', true);
                }
                if(this.connection_selected != null) {
                    this.connection_selected.classList.remove("selected");
                    this.removeReouteConnectionSelected();
                    this.connection_selected = null;
                }
                this.editor_selected = true;
                break;
            case 'main-path':
                if(this.node_selected != null) {
                    this.node_selected.classList.remove("selected");
                    this.node_selected = null;
                    this.dispatch('nodeUnselected', true);
                }
                if(this.connection_selected != null) {
                    this.connection_selected.classList.remove("selected");
                    this.removeReouteConnectionSelected();
                    this.connection_selected = null;
                }
                this.connection_selected = this.ele_selected;
                this.connection_selected.classList.add("selected");
                const listclassConnection = this.connection_selected.parentElement.classList;
                if(listclassConnection.length > 1){
                    this.dispatch('connectionSelected', { output_id: listclassConnection[2].slice(14), input_id: listclassConnection[1].slice(13), output_class: listclassConnection[3], input_class: listclassConnection[4] });
                    if(this.reroute_fix_curvature) {
                        this.connection_selected.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
                            item.classList.add("selected");
                        });
                    }
                }
                break;
            case 'point':
                this.drag_point = true;
                this.ele_selected.classList.add("selected");
                break;
            case 'drawflow-delete':
                if(this.node_selected ) {
                    this.removeNodeId(this.node_selected.id);
                }

                if(this.connection_selected) {
                    this.removeConnection();
                }

                if(this.node_selected != null) {
                    this.node_selected.classList.remove("selected");
                    this.node_selected = null;
                    this.dispatch('nodeUnselected', true);
                }
                if(this.connection_selected != null) {
                    this.connection_selected.classList.remove("selected");
                    this.removeReouteConnectionSelected();
                    this.connection_selected = null;
                }

                break;
            default:
        }
        if (e.type === "touchstart") {
            this.pos_x = e.touches[0].clientX;
            this.pos_x_start = e.touches[0].clientX;
            this.pos_y = e.touches[0].clientY;
            this.pos_y_start = e.touches[0].clientY;
        } else {
            this.pos_x = e.clientX;
            this.pos_x_start = e.clientX;
            this.pos_y = e.clientY;
            this.pos_y_start = e.clientY;
        }
        if (['input','output','main-path'].includes(this.ele_selected.classList[0])) {
            e.preventDefault();
        }
        this.dispatch('clickEnd', e);
    }

    position(e) {
        if (e.type === "touchmove") {
            var e_pos_x = e.touches[0].clientX;
            var e_pos_y = e.touches[0].clientY;
        } else {
            var e_pos_x = e.clientX;
            var e_pos_y = e.clientY;
        }


        if(this.connection) {
            this.updateConnection(e_pos_x, e_pos_y);
        }
        if(this.editor_selected) {
            x =  this.canvas_x + (-(this.pos_x - e_pos_x))
            y = this.canvas_y + (-(this.pos_y - e_pos_y))
            this.dispatch('translate', { x: x, y: y});
            this.precanvas.style.transform = "translate("+x+"px, "+y+"px) scale("+this.zoom+")";
        }
        if(this.drag) {
            e.preventDefault();
            var x = (this.pos_x - e_pos_x) * this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom);
            var y = (this.pos_y - e_pos_y) * this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom);
            this.pos_x = e_pos_x;
            this.pos_y = e_pos_y;

            this.ele_selected.style.top = (this.ele_selected.offsetTop - y) + "px";
            this.ele_selected.style.left = (this.ele_selected.offsetLeft - x) + "px";

            this.drawflow.drawflow[this.module].data[this.ele_selected.id.slice(5)].pos_x = (this.ele_selected.offsetLeft - x);
            this.drawflow.drawflow[this.module].data[this.ele_selected.id.slice(5)].pos_y = (this.ele_selected.offsetTop - y);

            this.updateConnectionNodes(this.ele_selected.id)
        }

        if(this.drag_point) {

            var x = (this.pos_x - e_pos_x) * this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom);
            var y = (this.pos_y - e_pos_y) * this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom);
            this.pos_x = e_pos_x;
            this.pos_y = e_pos_y;

            var pos_x = this.pos_x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)));
            var pos_y = this.pos_y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)));

            this.ele_selected.setAttributeNS(null, 'cx', pos_x);
            this.ele_selected.setAttributeNS(null, 'cy', pos_y);

            const nodeUpdate = this.ele_selected.parentElement.classList[2].slice(9);
            const nodeUpdateIn = this.ele_selected.parentElement.classList[1].slice(13);
            const output_class = this.ele_selected.parentElement.classList[3];
            const input_class = this.ele_selected.parentElement.classList[4];

            let numberPointPosition = Array.from(this.ele_selected.parentElement.children).indexOf(this.ele_selected)-1;

            if(this.reroute_fix_curvature) {
                const numberMainPath = this.ele_selected.parentElement.querySelectorAll(".main-path").length-1;
                numberPointPosition -= numberMainPath;
                if(numberPointPosition < 0) {
                    numberPointPosition = 0;
                }
            }

            const nodeId = nodeUpdate.slice(5);
            const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
                return item.node ===  nodeUpdateIn && item.output === input_class;
            });

            this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points[numberPointPosition] = { pos_x: pos_x, pos_y: pos_y };

            const parentSelected = this.ele_selected.parentElement.classList[2].slice(9);

            this.updateConnectionNodes(parentSelected);
        }

        if (e.type === "touchmove") {
            this.mouse_x = e_pos_x;
            this.mouse_y = e_pos_y;
        }
        this.dispatch('mouseMove', {x: e_pos_x,y: e_pos_y });
    }

    dragEnd(e) {
        if (e.type === "touchend") {
            var e_pos_x = this.mouse_x;
            var e_pos_y = this.mouse_y;
            var ele_last = document.elementFromPoint(e_pos_x, e_pos_y);
        } else {
            var e_pos_x = e.clientX;
            var e_pos_y = e.clientY;
            var ele_last = e.target;
        }

        if(this.drag) {
            if(this.pos_x_start != e_pos_x || this.pos_y_start != e_pos_y) {
                this.dispatch('nodeMoved', this.ele_selected.id.slice(5));
            }
        }

        if(this.drag_point) {
            this.ele_selected.classList.remove("selected");
            if(this.pos_x_start != e_pos_x || this.pos_y_start != e_pos_y) {
                this.dispatch('rerouteMoved', this.ele_selected.parentElement.classList[2].slice(14));
            }
        }

        if(this.editor_selected) {
            this.canvas_x = this.canvas_x + (-(this.pos_x - e_pos_x));
            this.canvas_y = this.canvas_y + (-(this.pos_y - e_pos_y));
            this.editor_selected = false;
        }
        if(this.connection === true) {
            if(ele_last.classList[0] === 'input' || (this.force_first_input && (ele_last.closest(".drawflow_content_node") != null || ele_last.classList[0] === 'drawflow-node'))) {

                if(this.force_first_input && (ele_last.closest(".drawflow_content_node") != null || ele_last.classList[0] === 'drawflow-node')) {
                    if(ele_last.closest(".drawflow_content_node") != null) {
                        var input_id = ele_last.closest(".drawflow_content_node").parentElement.id;
                    } else {
                        var input_id = ele_last.id;
                    }
                    if(Object.keys(this.getNodeFromId(input_id.slice(5)).inputs).length === 0) {
                        var input_class = false;
                    } else {
                        var input_class = "input_1";
                    }


                } else {
                    // Fix connection;
                    var input_id = ele_last.parentElement.parentElement.id;
                    var input_class = ele_last.classList[1];
                }
                var output_id = this.ele_selected.parentElement.parentElement.id;
                var output_class = this.ele_selected.classList[1];

                if(output_id !== input_id && input_class !== false) {

                    if(this.container.querySelectorAll('.connection.node_in_'+input_id+'.node_out_'+output_id+'.'+output_class+'.'+input_class).length === 0) {
                        // Conection no exist save connection

                        this.connection_ele.classList.add("node_in_"+input_id);
                        this.connection_ele.classList.add("node_out_"+output_id);
                        this.connection_ele.classList.add(output_class);
                        this.connection_ele.classList.add(input_class);
                        var id_input = input_id.slice(5);
                        var id_output = output_id.slice(5);

                        this.drawflow.drawflow[this.module].data[id_output].outputs[output_class].connections.push( {"node": id_input, "output": input_class});
                        this.drawflow.drawflow[this.module].data[id_input].inputs[input_class].connections.push( {"node": id_output, "input": output_class});
                        this.updateConnectionNodes('node-'+id_output);
                        this.updateConnectionNodes('node-'+id_input);
                        this.dispatch('connectionCreated', { output_id: id_output, input_id: id_input, output_class:  output_class, input_class: input_class});

                    } else {
                        this.dispatch('connectionCancel', true);
                        this.connection_ele.remove();
                    }

                    this.connection_ele = null;
                } else {
                    // Connection exists Remove Connection;
                    this.dispatch('connectionCancel', true);
                    this.connection_ele.remove();
                    this.connection_ele = null;
                }

            } else {
                // Remove Connection;
                this.dispatch('connectionCancel', true);
                this.connection_ele.remove();
                this.connection_ele = null;
            }
        }

        this.drag = false;
        this.drag_point = false;
        this.connection = false;
        this.ele_selected = null;
        this.editor_selected = false;

        this.dispatch('mouseUp', e);
    }
    contextmenu(e) {
        this.dispatch('contextmenu', e);
        e.preventDefault();
        if(this.editor_mode === 'fixed' || this.editor_mode === 'view') {
            return false;
        }
        if(this.precanvas.getElementsByClassName("drawflow-delete").length) {
            this.precanvas.getElementsByClassName("drawflow-delete")[0].remove()
        };
        if(this.node_selected || this.connection_selected) {
            var deletebox = document.createElement('div');
            deletebox.classList.add("drawflow-delete");
            deletebox.innerHTML = "x";
            if(this.node_selected) {
                this.node_selected.appendChild(deletebox);

            }
            if(this.connection_selected && (this.connection_selected.parentElement.classList.length > 1)) {
                deletebox.style.top = e.clientY * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y *  ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) ) + "px";
                deletebox.style.left = e.clientX * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x *  ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) ) + "px";

                this.precanvas.appendChild(deletebox);

            }

        }

    }
    contextmenuDel() {
        if(this.precanvas.getElementsByClassName("drawflow-delete").length) {
            this.precanvas.getElementsByClassName("drawflow-delete")[0].remove()
        };
    }

    key(e) {
        this.dispatch('keydown', e);
        if(this.editor_mode === 'fixed' || this.editor_mode === 'view') {
            return false;
        }
        if (e.key === 'Delete' || (e.key === 'Backspace' && e.metaKey)) {
            if(this.node_selected != null) {
                if(this.first_click.tagName !== 'INPUT' && this.first_click.tagName !== 'TEXTAREA' && this.first_click.hasAttribute('contenteditable') !== true) {
                    this.removeNodeId(this.node_selected.id);
                }
            }
            if(this.connection_selected != null) {
                this.removeConnection();
            }
        }
    }

    zoom_enter(event, delta) {
        if (event.ctrlKey) {
            event.preventDefault()
            if(event.deltaY > 0) {
                // Zoom Out
                this.zoom_out();
            } else {
                // Zoom In
                this.zoom_in();
            }
        }
    }
    zoom_refresh(){
        this.dispatch('zoom', this.zoom);
        this.canvas_x = (this.canvas_x / this.zoom_last_value) * this.zoom;
        this.canvas_y = (this.canvas_y / this.zoom_last_value) * this.zoom;
        this.zoom_last_value = this.zoom;
        this.precanvas.style.transform = "translate("+this.canvas_x+"px, "+this.canvas_y+"px) scale("+this.zoom+")";
    }
    zoom_in() {
        if(this.zoom < this.zoom_max) {
            this.zoom+=this.zoom_value;
            this.zoom_refresh();
        }
    }
    zoom_out() {
        if(this.zoom > this.zoom_min) {
            this.zoom-=this.zoom_value;
            this.zoom_refresh();
        }
    }
    zoom_reset(target = 1){
        if(this.zoom != target) {
            this.zoom = target;
            this.zoom_refresh();
        }
    }

    createCurvature(start_pos_x, start_pos_y, end_pos_x, end_pos_y, curvature_value, type) {
        var line_x = start_pos_x;
        var line_y = start_pos_y;
        var x = end_pos_x;
        var y = end_pos_y;
        var curvature = curvature_value;
        //type openclose open close other
        switch (type) {
            case 'open':
                if(start_pos_x >= end_pos_x) {
                    var hx1 = line_x + Math.abs(x - line_x) * curvature;
                    var hx2 = x - Math.abs(x - line_x) * (curvature*-1);
                } else {
                    var hx1 = line_x + Math.abs(x - line_x) * curvature;
                    var hx2 = x - Math.abs(x - line_x) * curvature;
                }
                return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;

                break
            case 'close':
                if(start_pos_x >= end_pos_x) {
                    var hx1 = line_x + Math.abs(x - line_x) * (curvature*-1);
                    var hx2 = x - Math.abs(x - line_x) * curvature;
                } else {
                    var hx1 = line_x + Math.abs(x - line_x) * curvature;
                    var hx2 = x - Math.abs(x - line_x) * curvature;
                }
                return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
                break;
            case 'other':
                if(start_pos_x >= end_pos_x) {
                    var hx1 = line_x + Math.abs(x - line_x) * (curvature*-1);
                    var hx2 = x - Math.abs(x - line_x) * (curvature*-1);
                } else {
                    var hx1 = line_x + Math.abs(x - line_x) * curvature;
                    var hx2 = x - Math.abs(x - line_x) * curvature;
                }
                return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
                break;
            default:

                var hx1 = line_x + Math.abs(x - line_x) * curvature;
                var hx2 = x - Math.abs(x - line_x) * curvature;

                return ' M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y;
        }

    }

    drawConnection(ele) {
        var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
        this.connection_ele = connection;
        var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
        path.classList.add("main-path");
        path.setAttributeNS(null, 'd', '');
        // path.innerHTML = 'a';
        connection.classList.add("connection");
        connection.appendChild(path);
        this.precanvas.appendChild(connection);
        var id_output = ele.parentElement.parentElement.id.slice(5);
        var output_class = ele.classList[1];
        this.dispatch('connectionStart', { output_id: id_output, output_class:  output_class });

    }

    updateConnection(eX, eY) {
        const precanvas = this.precanvas;
        const zoom = this.zoom;
        let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
        precanvasWitdhZoom = precanvasWitdhZoom || 0;
        let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
        precanvasHeightZoom = precanvasHeightZoom || 0;
        var path = this.connection_ele.children[0];

        var line_x = this.ele_selected.offsetWidth/2 + (this.ele_selected.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
        var line_y = this.ele_selected.offsetHeight/2 + (this.ele_selected.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

        var x = eX * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x *  ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) );
        var y = eY * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y *  ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) );

        var curvature = this.curvature;
        var lineCurve = this.createCurvature(line_x, line_y, x, y, curvature, 'openclose');
        path.setAttributeNS(null, 'd', lineCurve);

    }

    addConnection(id_output, id_input, output_class, input_class) {
        var nodeOneModule = this.getModuleFromNodeId(id_output);
        var nodeTwoModule = this.getModuleFromNodeId(id_input);
        if(nodeOneModule === nodeTwoModule) {

            var dataNode = this.getNodeFromId(id_output);
            var exist = false;
            for(var checkOutput in dataNode.outputs[output_class].connections){
                var connectionSearch = dataNode.outputs[output_class].connections[checkOutput]
                if(connectionSearch.node == id_input && connectionSearch.output == input_class) {
                    exist = true;
                }
            }
            // Check connection exist
            if(exist === false) {
                //Create Connection
                this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.push( {"node": id_input.toString(), "output": input_class});
                this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.push( {"node": id_output.toString(), "input": output_class});

                if(this.module === nodeOneModule) {
                    //Draw connection
                    var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
                    var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
                    path.classList.add("main-path");
                    path.setAttributeNS(null, 'd', '');
                    // path.innerHTML = 'a';
                    connection.classList.add("connection");
                    connection.classList.add("node_in_node-"+id_input);
                    connection.classList.add("node_out_node-"+id_output);
                    connection.classList.add(output_class);
                    connection.classList.add(input_class);
                    connection.appendChild(path);
                    this.precanvas.appendChild(connection);
                    this.updateConnectionNodes('node-'+id_output);
                    this.updateConnectionNodes('node-'+id_input);
                }

                this.dispatch('connectionCreated', { output_id: id_output, input_id: id_input, output_class:  output_class, input_class: input_class});
            }
        }
    }

    updateConnectionNodes(id) {

        // Aquí nos quedamos;
        const idSearch = 'node_in_'+id;
        const idSearchOut = 'node_out_'+id;
        var line_path = this.line_path/2;
        const container = this.container;
        const precanvas = this.precanvas;
        const curvature = this.curvature;
        const createCurvature = this.createCurvature;
        const reroute_curvature = this.reroute_curvature;
        const reroute_curvature_start_end = this.reroute_curvature_start_end;
        const reroute_fix_curvature = this.reroute_fix_curvature;
        const rerouteWidth = this.reroute_width;
        const zoom = this.zoom;
        let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
        precanvasWitdhZoom = precanvasWitdhZoom || 0;
        let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
        precanvasHeightZoom = precanvasHeightZoom || 0;

        const elemsOut = container.querySelectorAll(`.${idSearchOut}`);

        Object.keys(elemsOut).map(function(item, index) {
            if(elemsOut[item].querySelector('.point') === null) {

                var elemtsearchId_out = container.querySelector(`#${id}`);

                var id_search = elemsOut[item].classList[1].replace('node_in_', '');
                var elemtsearchId = container.querySelector(`#${id_search}`);

                var elemtsearch = elemtsearchId.querySelectorAll('.'+elemsOut[item].classList[4])[0]

                var eX = elemtsearch.offsetWidth/2 + (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                var eY = elemtsearch.offsetHeight/2 + (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                var elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+elemsOut[item].classList[3])[0]

                var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                var x = eX;
                var y = eY;

                const lineCurve = createCurvature(line_x, line_y, x, y, curvature, 'openclose');
                elemsOut[item].children[0].setAttributeNS(null, 'd', lineCurve );
            } else {
                const points = elemsOut[item].querySelectorAll('.point');
                let linecurve = '';
                const reoute_fix = [];
                points.forEach((item, i) => {
                    if(i === 0 && ((points.length -1) === 0)) {

                        var elemtsearchId_out = container.querySelector(`#${id}`);
                        var elemtsearch = item;

                        var eX =  (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var eY =  (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;

                        var elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[3])[0]
                        var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                        var elemtsearchId_out = item;
                        var id_search = item.parentElement.classList[1].replace('node_in_', '');
                        var elemtsearchId = container.querySelector(`#${id_search}`);
                        var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

                        var elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
                        var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;


                        var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                    } else if(i === 0) {

                        var elemtsearchId_out = container.querySelector(`#${id}`);
                        var elemtsearch = item;

                        var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;

                        var elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[3])[0]
                        var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                        // SECOND
                        var elemtsearchId_out = item;
                        var elemtsearch = points[i+1];

                        var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                    } else if (i === (points.length -1)) {

                        var elemtsearchId_out = item;

                        var id_search = item.parentElement.classList[1].replace('node_in_', '');
                        var elemtsearchId = container.querySelector(`#${id_search}`);
                        var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

                        var elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
                        var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;
                        var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
                        var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                    } else {
                        var elemtsearchId_out = item;
                        var elemtsearch = points[i+1];

                        var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
                        var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) +rerouteWidth;
                        var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
                        var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);
                    }

                });
                if(reroute_fix_curvature) {
                    reoute_fix.forEach((itempath, i) => {
                        elemsOut[item].children[i].setAttributeNS(null, 'd', itempath);
                    });

                } else {
                    elemsOut[item].children[0].setAttributeNS(null, 'd', linecurve);
                }

            }
        })

        const elems = container.querySelectorAll(`.${idSearch}`);
        Object.keys(elems).map(function(item, index) {

            if(elems[item].querySelector('.point') === null) {
                var elemtsearchId_in = container.querySelector(`#${id}`);

                var id_search = elems[item].classList[2].replace('node_out_', '');
                var elemtsearchId = container.querySelector(`#${id_search}`);
                var elemtsearch = elemtsearchId.querySelectorAll('.'+elems[item].classList[3])[0]

                var line_x = elemtsearch.offsetWidth/2 + (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                var line_y = elemtsearch.offsetHeight/2 + (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                var elemtsearchId_in = elemtsearchId_in.querySelectorAll('.'+elems[item].classList[4])[0]
                var x = elemtsearchId_in.offsetWidth/2 + (elemtsearchId_in.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                var y = elemtsearchId_in.offsetHeight/2 + (elemtsearchId_in.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                const lineCurve = createCurvature(line_x, line_y, x, y, curvature, 'openclose');
                elems[item].children[0].setAttributeNS(null, 'd', lineCurve );

            } else {
                const points = elems[item].querySelectorAll('.point');
                let linecurve = '';
                const reoute_fix = [];
                points.forEach((item, i) => {
                    if(i === 0 && ((points.length -1) === 0)) {

                        var elemtsearchId_out = container.querySelector(`#${id}`);
                        var elemtsearch = item;

                        var line_x = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var line_y = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;

                        var elemtsearchIn = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[4])[0]
                        var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                        var elemtsearchId_out = item;
                        var id_search = item.parentElement.classList[2].replace('node_out_', '');
                        var elemtsearchId = container.querySelector(`#${id_search}`);
                        var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]

                        var elemtsearchOut = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
                        var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                        var eX = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var eY = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);


                    } else if(i === 0) {
                        // FIRST
                        var elemtsearchId_out = item;
                        var id_search = item.parentElement.classList[2].replace('node_out_', '');
                        var elemtsearchId = container.querySelector(`#${id_search}`);
                        var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
                        var elemtsearchOut = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
                        var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                        var eX = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var eY = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                        // SECOND
                        var elemtsearchId_out = item;
                        var elemtsearch = points[i+1];

                        var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;
                        var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                    } else if (i === (points.length -1)) {

                        var elemtsearchId_out = item;

                        var id_search = item.parentElement.classList[1].replace('node_in_', '');
                        var elemtsearchId = container.querySelector(`#${id_search}`);
                        var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

                        var elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
                        var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
                        var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

                        var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);

                    } else {

                        var elemtsearchId_out = item;
                        var elemtsearch = points[i+1];

                        var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;
                        var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
                        var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
                        var x = eX;
                        var y = eY;

                        var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
                        linecurve += lineCurveSearch;
                        reoute_fix.push(lineCurveSearch);
                    }

                });
                if(reroute_fix_curvature) {
                    reoute_fix.forEach((itempath, i) => {
                        elems[item].children[i].setAttributeNS(null, 'd', itempath);
                    });

                } else {
                    elems[item].children[0].setAttributeNS(null, 'd', linecurve);
                }

            }
        })
    }

    dblclick(e) {
        if(this.connection_selected != null && this.reroute) {
            this.createReroutePoint(this.connection_selected);
        }

        if(e.target.classList[0] === 'point') {
            this.removeReroutePoint(e.target);
        }
    }

    createReroutePoint(ele) {
        this.connection_selected.classList.remove("selected");
        const nodeUpdate = this.connection_selected.parentElement.classList[2].slice(9);
        const nodeUpdateIn = this.connection_selected.parentElement.classList[1].slice(13);
        const output_class = this.connection_selected.parentElement.classList[3];
        const input_class = this.connection_selected.parentElement.classList[4];
        this.connection_selected = null;
        const point = document.createElementNS('http://www.w3.org/2000/svg',"circle");
        point.classList.add("point");
        var pos_x = this.pos_x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)));
        var pos_y = this.pos_y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)));

        point.setAttributeNS(null, 'cx', pos_x);
        point.setAttributeNS(null, 'cy', pos_y);
        point.setAttributeNS(null, 'r', this.reroute_width);

        let position_add_array_point = 0;
        if(this.reroute_fix_curvature) {

            const numberPoints = ele.parentElement.querySelectorAll(".main-path").length;
            var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
            path.classList.add("main-path");
            path.setAttributeNS(null, 'd', '');

            ele.parentElement.insertBefore(path, ele.parentElement.children[numberPoints]);
            if(numberPoints === 1) {
                ele.parentElement.appendChild(point);
            }  else {
                const search_point = Array.from(ele.parentElement.children).indexOf(ele)
                position_add_array_point = search_point;
                ele.parentElement.insertBefore(point, ele.parentElement.children[search_point+numberPoints+1]);
            }

        } else {
            ele.parentElement.appendChild(point);
        }

        const nodeId = nodeUpdate.slice(5);
        const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
            return item.node ===  nodeUpdateIn && item.output === input_class;
        });

        if(this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points === undefined)  {
            this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points = [];
        }

        if(this.reroute_fix_curvature) {

            if(position_add_array_point > 0 || this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points !== []) {
                this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.splice(position_add_array_point, 0, { pos_x: pos_x, pos_y: pos_y });
            } else {
                this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.push({ pos_x: pos_x, pos_y: pos_y });
            }

            ele.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
                item.classList.remove("selected");
            });

        } else {
            this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.push({ pos_x: pos_x, pos_y: pos_y });
        }

        this.dispatch('addReroute', nodeId);
        this.updateConnectionNodes(nodeUpdate);
    }

    removeReroutePoint(ele) {
        const nodeUpdate = ele.parentElement.classList[2].slice(9)
        const nodeUpdateIn = ele.parentElement.classList[1].slice(13);
        const output_class = ele.parentElement.classList[3];
        const input_class = ele.parentElement.classList[4];

        let numberPointPosition = Array.from(ele.parentElement.children).indexOf(ele);
        const nodeId = nodeUpdate.slice(5);
        const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
            return item.node ===  nodeUpdateIn && item.output === input_class;
        });

        if(this.reroute_fix_curvature) {
            const numberMainPath = ele.parentElement.querySelectorAll(".main-path").length
            ele.parentElement.children[numberMainPath-1].remove();
            numberPointPosition -= numberMainPath;
            if(numberPointPosition < 0) {
                numberPointPosition = 0;
            }
        } else {
            numberPointPosition--;
        }
        this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.splice(numberPointPosition,1);

        ele.remove();
        this.dispatch('removeReroute', nodeId);
        this.updateConnectionNodes(nodeUpdate);
    }

    registerNode(name, html, props = null, options = null) {
        this.noderegister[name] = {html: html, props: props, options: options};
    }

    getNodeFromId(id) {
        var moduleName = this.getModuleFromNodeId(id)
        return JSON.parse(JSON.stringify(this.drawflow.drawflow[moduleName].data[id]));
    }
    getNodesFromName(name) {
        var nodes = [];
        const editor = this.drawflow.drawflow
        Object.keys(editor).map(function(moduleName, index) {
            for (var node in editor[moduleName].data) {
                if(editor[moduleName].data[node].name == name) {
                    nodes.push(editor[moduleName].data[node].id);
                }
            }
        });
        return nodes;
    }

    addNode (name, num_in, num_out, ele_pos_x, ele_pos_y, classoverride, data, html, typenode = false) {
        if (this.useuuid) {
            var newNodeId = this.getUuid();
        } else {
            var newNodeId = this.nodeId;
        }
        const parent = document.createElement('div');
        parent.classList.add("parent-node");

        const node = document.createElement('div');
        node.innerHTML = "";
        node.setAttribute("id", "node-"+newNodeId);
        node.classList.add("drawflow-node");
        if(classoverride != '') {
            node.classList.add(...classoverride.split(' '));
        }

        const inputs = document.createElement('div');
        inputs.classList.add("inputs");

        const outputs = document.createElement('div');
        outputs.classList.add("outputs");

        const json_inputs = {}
        for(var x = 0; x < num_in; x++) {
            const input = document.createElement('div');
            input.classList.add("input");
            input.classList.add("input_"+(x+1));
            json_inputs["input_"+(x+1)] = { "connections": []};
            inputs.appendChild(input);
        }

        const json_outputs = {}
        for(var x = 0; x < num_out; x++) {
            const output = document.createElement('div');
            output.classList.add("output");
            output.classList.add("output_"+(x+1));
            json_outputs["output_"+(x+1)] = { "connections": []};
            outputs.appendChild(output);
        }

        const content = document.createElement('div');
        content.classList.add("drawflow_content_node");
        if(typenode === false) {
            content.innerHTML = html;
        } else if (typenode === true) {
            content.appendChild(this.noderegister[html].html.cloneNode(true));
        } else {
            if(parseInt(this.render.version) === 3 ) {
                //Vue 3
                let wrapper = this.render.h(this.noderegister[html].html, this.noderegister[html].props, this.noderegister[html].options);
                wrapper.appContext = this.parent;
                this.render.render(wrapper,content);

            } else {
                // Vue 2
                let wrapper = new this.render({
                    parent: this.parent,
                    render: h => h(this.noderegister[html].html, { props: this.noderegister[html].props }),
                    ...this.noderegister[html].options
                }).$mount()
                //
                content.appendChild(wrapper.$el);
            }
        }

        Object.entries(data).forEach(function (key, value) {
            if(typeof key[1] === "object") {
                insertObjectkeys(null, key[0], key[0]);
            } else {
                var elems = content.querySelectorAll('[df-'+key[0]+']');
                for(var i = 0; i < elems.length; i++) {
                    elems[i].value = key[1];
                    if(elems[i].isContentEditable) {
                        elems[i].innerText = key[1];
                    }
                }
            }
        })

        function insertObjectkeys(object, name, completname) {
            if(object === null) {
                var object = data[name];
            } else {
                var object = object[name]
            }
            if(object !== null) {
                Object.entries(object).forEach(function (key, value) {
                    if(typeof key[1] === "object") {
                        insertObjectkeys(object, key[0], completname+'-'+key[0]);
                    } else {
                        var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
                        for(var i = 0; i < elems.length; i++) {
                            elems[i].value = key[1];
                            if(elems[i].isContentEditable) {
                                elems[i].innerText = key[1];
                            }
                        }
                    }
                });
            }
        }
        node.appendChild(inputs);
        node.appendChild(content);
        node.appendChild(outputs);
        node.style.top = ele_pos_y + "px";
        node.style.left = ele_pos_x + "px";
        parent.appendChild(node);
        this.precanvas.appendChild(parent);
        var json = {
            id: newNodeId,
            name: name,
            data: data,
            class: classoverride,
            html: html,
            typenode: typenode,
            inputs: json_inputs,
            outputs: json_outputs,
            pos_x: ele_pos_x,
            pos_y: ele_pos_y,
        }
        this.drawflow.drawflow[this.module].data[newNodeId] = json;
        this.dispatch('nodeCreated', newNodeId);
        if (!this.useuuid) {
            this.nodeId++;
        }
        return newNodeId;
    }

    addNodeImport (dataNode, precanvas) {
        const parent = document.createElement('div');
        parent.classList.add("parent-node");

        const node = document.createElement('div');
        node.innerHTML = "";
        node.setAttribute("id", "node-"+dataNode.id);
        node.classList.add("drawflow-node");
        if(dataNode.class != '') {
            node.classList.add(...dataNode.class.split(' '));
        }

        const inputs = document.createElement('div');
        inputs.classList.add("inputs");

        const outputs = document.createElement('div');
        outputs.classList.add("outputs");

        Object.keys(dataNode.inputs).map(function(input_item, index) {
            const input = document.createElement('div');
            input.classList.add("input");
            input.classList.add(input_item);
            inputs.appendChild(input);
            Object.keys(dataNode.inputs[input_item].connections).map(function(output_item, index) {

                var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
                var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
                path.classList.add("main-path");
                path.setAttributeNS(null, 'd', '');
                // path.innerHTML = 'a';
                connection.classList.add("connection");
                connection.classList.add("node_in_node-"+dataNode.id);
                connection.classList.add("node_out_node-"+dataNode.inputs[input_item].connections[output_item].node);
                connection.classList.add(dataNode.inputs[input_item].connections[output_item].input);
                connection.classList.add(input_item);

                connection.appendChild(path);
                precanvas.appendChild(connection);

            });
        });

        for(var x = 0; x < Object.keys(dataNode.outputs).length; x++) {
            const output = document.createElement('div');
            output.classList.add("output");
            output.classList.add("output_"+(x+1));
            outputs.appendChild(output);
        }

        const content = document.createElement('div');
        content.classList.add("drawflow_content_node");

        if(dataNode.typenode === false) {
            content.innerHTML = dataNode.html;
        } else if (dataNode.typenode === true) {
            content.appendChild(this.noderegister[dataNode.html].html.cloneNode(true));
        } else {
            if(parseInt(this.render.version) === 3 ) {
                //Vue 3
                let wrapper = this.render.h(this.noderegister[dataNode.html].html, this.noderegister[dataNode.html].props, this.noderegister[dataNode.html].options);
                wrapper.appContext = this.parent;
                this.render.render(wrapper,content);

            } else {
                //Vue 2
                let wrapper = new this.render({
                    parent: this.parent,
                    render: h => h(this.noderegister[dataNode.html].html, { props: this.noderegister[dataNode.html].props }),
                    ...this.noderegister[dataNode.html].options
                }).$mount()
                content.appendChild(wrapper.$el);
            }
        }

        Object.entries(dataNode.data).forEach(function (key, value) {
            if(typeof key[1] === "object") {
                insertObjectkeys(null, key[0], key[0]);
            } else {
                var elems = content.querySelectorAll('[df-'+key[0]+']');
                for(var i = 0; i < elems.length; i++) {
                    elems[i].value = key[1];
                    if(elems[i].isContentEditable) {
                        elems[i].innerText = key[1];
                    }
                }
            }
        })

        function insertObjectkeys(object, name, completname) {
            if(object === null) {
                var object = dataNode.data[name];
            } else {
                var object = object[name]
            }
            if(object !== null) {
                Object.entries(object).forEach(function (key, value) {
                    if(typeof key[1] === "object") {
                        insertObjectkeys(object, key[0], completname+'-'+key[0]);
                    } else {
                        var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
                        for(var i = 0; i < elems.length; i++) {
                            elems[i].value = key[1];
                            if(elems[i].isContentEditable) {
                                elems[i].innerText = key[1];
                            }
                        }
                    }
                });
            }
        }
        node.appendChild(inputs);
        node.appendChild(content);
        node.appendChild(outputs);
        node.style.top = dataNode.pos_y + "px";
        node.style.left = dataNode.pos_x + "px";
        parent.appendChild(node);
        this.precanvas.appendChild(parent);
    }

    addRerouteImport(dataNode) {
        const reroute_width = this.reroute_width
        const reroute_fix_curvature = this.reroute_fix_curvature
        const container = this.container;
        Object.keys(dataNode.outputs).map(function(output_item, index) {
            Object.keys(dataNode.outputs[output_item].connections).map(function(input_item, index) {
                const points = dataNode.outputs[output_item].connections[input_item].points
                if(points !== undefined) {

                    points.forEach((item, i) => {
                        const input_id = dataNode.outputs[output_item].connections[input_item].node;
                        const input_class = dataNode.outputs[output_item].connections[input_item].output;
                        const ele = container.querySelector('.connection.node_in_node-'+input_id+'.node_out_node-'+dataNode.id+'.'+output_item+'.'+input_class);

                        if(reroute_fix_curvature) {
                            if(i === 0) {
                                for (var z = 0; z < points.length; z++) {
                                    var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
                                    path.classList.add("main-path");
                                    path.setAttributeNS(null, 'd', '');
                                    ele.appendChild(path);

                                }
                            }
                        }

                        const point = document.createElementNS('http://www.w3.org/2000/svg',"circle");
                        point.classList.add("point");
                        var pos_x = item.pos_x;
                        var pos_y = item.pos_y;

                        point.setAttributeNS(null, 'cx', pos_x);
                        point.setAttributeNS(null, 'cy', pos_y);
                        point.setAttributeNS(null, 'r', reroute_width);

                        ele.appendChild(point);
                    });
                };
            });
        });
    }

    updateNodeValue(event) {
        var attr = event.target.attributes
        for (var i = 0; i < attr.length; i++) {
            if (attr[i].nodeName.startsWith('df-')) {
                var keys = attr[i].nodeName.slice(3).split("-");
                var target = this.drawflow.drawflow[this.module].data[event.target.closest(".drawflow_content_node").parentElement.id.slice(5)].data;
                for (var index = 0; index < keys.length - 1; index += 1) {
                    if (target[keys[index]] == null) {
                        target[keys[index]] = {};
                    }
                    target = target[keys[index]];
                }
                target[keys[keys.length - 1]] = event.target.value;
                if(event.target.isContentEditable) {
                    target[keys[keys.length - 1]] = event.target.innerText;
                }
                this.dispatch('nodeDataChanged', event.target.closest(".drawflow_content_node").parentElement.id.slice(5));
            }
        }
    }

    updateNodeDataFromId(id, data) {
        var moduleName = this.getModuleFromNodeId(id)
        this.drawflow.drawflow[moduleName].data[id].data = data;
        if(this.module === moduleName) {
            const content = this.container.querySelector('#node-'+id);

            Object.entries(data).forEach(function (key, value) {
                if(typeof key[1] === "object") {
                    insertObjectkeys(null, key[0], key[0]);
                } else {
                    var elems = content.querySelectorAll('[df-'+key[0]+']');
                    for(var i = 0; i < elems.length; i++) {
                        elems[i].value = key[1];
                        if(elems[i].isContentEditable) {
                            elems[i].innerText = key[1];
                        }
                    }
                }
            })

            function insertObjectkeys(object, name, completname) {
                if(object === null) {
                    var object = data[name];
                } else {
                    var object = object[name]
                }
                if(object !== null) {
                    Object.entries(object).forEach(function (key, value) {
                        if(typeof key[1] === "object") {
                            insertObjectkeys(object, key[0], completname+'-'+key[0]);
                        } else {
                            var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
                            for(var i = 0; i < elems.length; i++) {
                                elems[i].value = key[1];
                                if(elems[i].isContentEditable) {
                                    elems[i].innerText = key[1];
                                }
                            }
                        }
                    });
                }
            }

        }
    }

    addNodeInput(id) {
        var moduleName = this.getModuleFromNodeId(id)
        const infoNode = this.getNodeFromId(id)
        const numInputs = Object.keys(infoNode.inputs).length;
        if(this.module === moduleName) {
            //Draw input
            const input = document.createElement('div');
            input.classList.add("input");
            input.classList.add("input_"+(numInputs+1));
            const parent = this.container.querySelector('#node-'+id+' .inputs');
            parent.appendChild(input);
            this.updateConnectionNodes('node-'+id);

        }
        this.drawflow.drawflow[moduleName].data[id].inputs["input_"+(numInputs+1)] = { "connections": []};
    }

    addNodeOutput(id) {
        var moduleName = this.getModuleFromNodeId(id)
        const infoNode = this.getNodeFromId(id)
        const numOutputs = Object.keys(infoNode.outputs).length;
        if(this.module === moduleName) {
            //Draw output
            const output = document.createElement('div');
            output.classList.add("output");
            output.classList.add("output_"+(numOutputs+1));
            const parent = this.container.querySelector('#node-'+id+' .outputs');
            parent.appendChild(output);
            this.updateConnectionNodes('node-'+id);

        }
        this.drawflow.drawflow[moduleName].data[id].outputs["output_"+(numOutputs+1)] = { "connections": []};
    }

    removeNodeInput(id, input_class) {
        var moduleName = this.getModuleFromNodeId(id)
        const infoNode = this.getNodeFromId(id)
        if(this.module === moduleName) {
            this.container.querySelector('#node-'+id+' .inputs .input.'+input_class).remove();
        }
        const removeInputs = [];
        Object.keys(infoNode.inputs[input_class].connections).map(function(key, index) {
            const id_output = infoNode.inputs[input_class].connections[index].node;
            const output_class = infoNode.inputs[input_class].connections[index].input;
            removeInputs.push({id_output, id, output_class, input_class})
        })
        // Remove connections
        removeInputs.forEach((item, i) => {
            this.removeSingleConnection(item.id_output, item.id, item.output_class, item.input_class);
        });

        delete this.drawflow.drawflow[moduleName].data[id].inputs[input_class];

        // Update connection
        const connections = [];
        const connectionsInputs = this.drawflow.drawflow[moduleName].data[id].inputs
        Object.keys(connectionsInputs).map(function(key, index) {
            connections.push(connectionsInputs[key]);
        });
        this.drawflow.drawflow[moduleName].data[id].inputs = {};
        const input_class_id = input_class.slice(6);
        let nodeUpdates = [];
        connections.forEach((item, i) => {
            item.connections.forEach((itemx, f) => {
                nodeUpdates.push(itemx);
            });
            this.drawflow.drawflow[moduleName].data[id].inputs['input_'+ (i+1)] = item;
        });
        nodeUpdates =  new Set(nodeUpdates.map(e => JSON.stringify(e)));
        nodeUpdates = Array.from(nodeUpdates).map(e => JSON.parse(e));

        if(this.module === moduleName) {
            const eles = this.container.querySelectorAll("#node-"+id +" .inputs .input");
            eles.forEach((item, i) => {
                const id_class = item.classList[1].slice(6);
                if(parseInt(input_class_id) < parseInt(id_class)) {
                    item.classList.remove('input_'+id_class);
                    item.classList.add('input_'+(id_class-1));
                }
            });

        }

        nodeUpdates.forEach((itemx, i) => {
            this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections.forEach((itemz, g) => {
                if(itemz.node == id) {
                    const output_id = itemz.output.slice(6);
                    if(parseInt(input_class_id) < parseInt(output_id)) {
                        if(this.module === moduleName) {
                            const ele = this.container.querySelector(".connection.node_in_node-"+id+".node_out_node-"+itemx.node+"."+itemx.input+".input_"+output_id);
                            ele.classList.remove('input_'+output_id);
                            ele.classList.add('input_'+(output_id-1));
                        }
                        if(itemz.points) {
                            this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections[g] = { node: itemz.node, output: 'input_'+(output_id-1), points: itemz.points }
                        } else {
                            this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections[g] = { node: itemz.node, output: 'input_'+(output_id-1)}
                        }
                    }
                }
            });
        });
        this.updateConnectionNodes('node-'+id);
    }

    removeNodeOutput(id, output_class) {
        var moduleName = this.getModuleFromNodeId(id)
        const infoNode = this.getNodeFromId(id)
        if(this.module === moduleName) {
            this.container.querySelector('#node-'+id+' .outputs .output.'+output_class).remove();
        }
        const removeOutputs = [];
        Object.keys(infoNode.outputs[output_class].connections).map(function(key, index) {
            const id_input = infoNode.outputs[output_class].connections[index].node;
            const input_class = infoNode.outputs[output_class].connections[index].output;
            removeOutputs.push({id, id_input, output_class, input_class})
        })
        // Remove connections
        removeOutputs.forEach((item, i) => {
            this.removeSingleConnection(item.id, item.id_input, item.output_class, item.input_class);
        });

        delete this.drawflow.drawflow[moduleName].data[id].outputs[output_class];

        // Update connection
        const connections = [];
        const connectionsOuputs = this.drawflow.drawflow[moduleName].data[id].outputs
        Object.keys(connectionsOuputs).map(function(key, index) {
            connections.push(connectionsOuputs[key]);
        });
        this.drawflow.drawflow[moduleName].data[id].outputs = {};
        const output_class_id = output_class.slice(7);
        let nodeUpdates = [];
        connections.forEach((item, i) => {
            item.connections.forEach((itemx, f) => {
                nodeUpdates.push({ node: itemx.node, output: itemx.output });
            });
            this.drawflow.drawflow[moduleName].data[id].outputs['output_'+ (i+1)] = item;
        });
        nodeUpdates =  new Set(nodeUpdates.map(e => JSON.stringify(e)));
        nodeUpdates = Array.from(nodeUpdates).map(e => JSON.parse(e));

        if(this.module === moduleName) {
            const eles = this.container.querySelectorAll("#node-"+id +" .outputs .output");
            eles.forEach((item, i) => {
                const id_class = item.classList[1].slice(7);
                if(parseInt(output_class_id) < parseInt(id_class)) {
                    item.classList.remove('output_'+id_class);
                    item.classList.add('output_'+(id_class-1));
                }
            });

        }

        nodeUpdates.forEach((itemx, i) => {
            this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections.forEach((itemz, g) => {
                if(itemz.node == id) {
                    const input_id = itemz.input.slice(7);
                    if(parseInt(output_class_id) < parseInt(input_id)) {
                        if(this.module === moduleName) {

                            const ele = this.container.querySelector(".connection.node_in_node-"+itemx.node+".node_out_node-"+id+".output_"+input_id+"."+itemx.output);
                            ele.classList.remove('output_'+input_id);
                            ele.classList.remove(itemx.output);
                            ele.classList.add('output_'+(input_id-1));
                            ele.classList.add(itemx.output);
                        }
                        if(itemz.points) {
                            this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections[g] = { node: itemz.node, input: 'output_'+(input_id-1), points: itemz.points }
                        } else {
                            this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections[g] = { node: itemz.node, input: 'output_'+(input_id-1)}
                        }
                    }
                }
            });
        });

        this.updateConnectionNodes('node-'+id);
    }

    removeNodeId(id) {
        this.removeConnectionNodeId(id);
        var moduleName = this.getModuleFromNodeId(id.slice(5))
        if(this.module === moduleName) {
            this.container.querySelector(`#${id}`).remove();
        }
        delete this.drawflow.drawflow[moduleName].data[id.slice(5)];
        this.dispatch('nodeRemoved', id.slice(5));
    }

    removeConnection() {
        if(this.connection_selected != null) {
            var listclass = this.connection_selected.parentElement.classList;
            this.connection_selected.parentElement.remove();
            //console.log(listclass);
            var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
                return item.node === listclass[1].slice(13) && item.output === listclass[4]
            });
            this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

            var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
                return item.node === listclass[2].slice(14) && item.input === listclass[3]
            });
            this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);
            this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
            this.connection_selected = null;
        }
    }

    removeSingleConnection(id_output, id_input, output_class, input_class) {
        var nodeOneModule = this.getModuleFromNodeId(id_output);
        var nodeTwoModule = this.getModuleFromNodeId(id_input);
        if(nodeOneModule === nodeTwoModule) {
            // Check nodes in same module.

            // Check connection exist
            var exists = this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.findIndex(function(item,i) {
                return item.node == id_input && item.output === input_class
            });
            if(exists > -1) {

                if(this.module === nodeOneModule) {
                    // In same module with view.
                    this.container.querySelector('.connection.node_in_node-'+id_input+'.node_out_node-'+id_output+'.'+output_class+'.'+input_class).remove();
                }

                var index_out = this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.findIndex(function(item,i) {
                    return item.node == id_input && item.output === input_class
                });
                this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.splice(index_out,1);

                var index_in = this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.findIndex(function(item,i) {
                    return item.node == id_output && item.input === output_class
                });
                this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.splice(index_in,1);

                this.dispatch('connectionRemoved', { output_id: id_output, input_id: id_input, output_class:  output_class, input_class: input_class});
                return true;

            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    removeConnectionNodeId(id) {
        const idSearchIn = 'node_in_'+id;
        const idSearchOut = 'node_out_'+id;

        const elemsOut = this.container.querySelectorAll(`.${idSearchOut}`);
        for(var i = elemsOut.length-1; i >= 0; i--) {
            var listclass = elemsOut[i].classList;

            var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
                return item.node === listclass[2].slice(14) && item.input === listclass[3]
            });
            this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

            var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
                return item.node === listclass[1].slice(13) && item.output === listclass[4]
            });
            this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

            elemsOut[i].remove();

            this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
        }

        const elemsIn = this.container.querySelectorAll(`.${idSearchIn}`);
        for(var i = elemsIn.length-1; i >= 0; i--) {

            var listclass = elemsIn[i].classList;

            var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
                return item.node === listclass[1].slice(13) && item.output === listclass[4]
            });
            this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

            var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
                return item.node === listclass[2].slice(14) && item.input === listclass[3]
            });
            this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

            elemsIn[i].remove();

            this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
        }
    }

    getModuleFromNodeId(id) {
        var nameModule;
        const editor = this.drawflow.drawflow
        Object.keys(editor).map(function(moduleName, index) {
            Object.keys(editor[moduleName].data).map(function(node, index2) {
                if(node == id) {
                    nameModule = moduleName;
                }
            })
        });
        return nameModule;
    }

    addModule(name) {
        this.drawflow.drawflow[name] =  { "data": {} };
        this.dispatch('moduleCreated', name);
    }
    changeModule(name) {
        this.dispatch('moduleChanged', name);
        this.module = name;
        this.precanvas.innerHTML = "";
        this.canvas_x = 0;
        this.canvas_y = 0;
        this.pos_x = 0;
        this.pos_y = 0;
        this.mouse_x = 0;
        this.mouse_y = 0;
        this.zoom = 1;
        this.zoom_last_value = 1;
        this.precanvas.style.transform = '';
        this.import(this.drawflow, false);
    }

    removeModule(name) {
        if(this.module === name) {
            this.changeModule('Home');
        }
        delete this.drawflow.drawflow[name];
        this.dispatch('moduleRemoved', name);
    }

    clearModuleSelected() {
        this.precanvas.innerHTML = "";
        this.drawflow.drawflow[this.module] =  { "data": {} };
    }

    clear () {
        this.precanvas.innerHTML = "";
        this.drawflow = { "drawflow": { "Home": { "data": {} }}};
    }
    export () {
        const dataExport = JSON.parse(JSON.stringify(this.drawflow));
        this.dispatch('export', dataExport);
        return dataExport;
    }

    import (data, notifi = true) {
        this.clear();
        this.drawflow = JSON.parse(JSON.stringify(data));
        this.load();
        if(notifi) {
            this.dispatch('import', 'import');
        }
    }

    /* Events */
    on (event, callback) {
        // Check if the callback is not a function
        if (typeof callback !== 'function') {
            console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
            return false;
        }
        // Check if the event is not a string
        if (typeof event !== 'string') {
            console.error(`The event name must be a string, the given type is ${typeof event}`);
            return false;
        }
        // Check if this event not exists
        if (this.events[event] === undefined) {
            this.events[event] = {
                listeners: []
            }
        }
        this.events[event].listeners.push(callback);
    }

    removeListener (event, callback) {
        // Check if this event not exists

        if (!this.events[event]) return false

        const listeners = this.events[event].listeners
        const listenerIndex = listeners.indexOf(callback)
        const hasListener = listenerIndex > -1
        if (hasListener) listeners.splice(listenerIndex, 1)
    }

    dispatch (event, details) {
        // Check if this event not exists
        if (this.events[event] === undefined) {
            // console.error(`This event: ${event} does not exist`);
            return false;
        }
        this.events[event].listeners.forEach((listener) => {
            listener(details);
        });
    }

    getUuid() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }
}

// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/editorview.js + 7 modules
var editorview = __webpack_require__(33);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/extension.js
var extension = __webpack_require__(179);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/decoration.js
var decoration = __webpack_require__(22);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/heightmap.js
var heightmap = __webpack_require__(625);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/bidi.js
var view_bidi = __webpack_require__(456);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/input.js
var input = __webpack_require__(516);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/utils/keyname.js
const base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    229: "q"
};
const shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: "\"",
    229: "Q"
};
const chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
const safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
const gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
const mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
const ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
const brokenModifierNames = chrome && (mac || +chrome[1] < 57) || gecko && mac;
// Fill in the digit keys
for (let i = 0; i < 10; i++)
    base[48 + i] = base[96 + i] = String(i);
// The function keys
for (let i = 1; i <= 24; i++)
    base[i + 111] = "F" + i;
// And the alphabetic keys
for (let i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
}
// For each code that doesn't have a shift-equivalent, copy the base name
for (let code in base)
    if (!shift.hasOwnProperty(code))
        shift[code] = base[code];
function keyName(event) {
    // Don't trust event.key in Chrome when there are modifiers until they fix https://bugs.chromium.org/p/chromium/issues/detail?id=633838
    let ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || (safari || ie) && event.shiftKey && event.key && event.key.length == 1;
    let name = (!ignoreKey && event.key) || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    // Edge sometimes produces wrong names (Issue #3)
    if (name == "Esc")
        name = "Escape";
    if (name == "Del")
        name = "Delete";
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8860571/
    if (name == "Left")
        name = "ArrowLeft";
    if (name == "Up")
        name = "ArrowUp";
    if (name == "Right")
        name = "ArrowRight";
    if (name == "Down")
        name = "ArrowDown";
    return name;
}

// EXTERNAL MODULE: ./sys/public/js/editor/dist/state/index.js + 12 modules
var dist_state = __webpack_require__(535);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/browser.js
var browser = __webpack_require__(362);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/keymap.js





const currentPlatform = browser/* default.mac */.Z.mac ? "mac" : browser/* default.windows */.Z.windows ? "win" : browser/* default.linux */.Z.linux ? "linux" : "key";
function normalizeKeyName(name, platform) {
    const parts = name.split(/-(?!$)/);
    let result = parts[parts.length - 1];
    if (result == "Space")
        result = " ";
    let alt, ctrl, shift, meta;
    for (let i = 0; i < parts.length - 1; ++i) {
        const mod = parts[i];
        if (/^(cmd|meta|m)$/i.test(mod))
            meta = true;
        else if (/^a(lt)?$/i.test(mod))
            alt = true;
        else if (/^(c|ctrl|control)$/i.test(mod))
            ctrl = true;
        else if (/^s(hift)?$/i.test(mod))
            shift = true;
        else if (/^mod$/i.test(mod)) {
            if (platform == "mac")
                meta = true;
            else
                ctrl = true;
        }
        else
            throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
        result = "Alt-" + result;
    if (ctrl)
        result = "Ctrl-" + result;
    if (meta)
        result = "Meta-" + result;
    if (shift)
        result = "Shift-" + result;
    return result;
}
function modifiers(name, event, shift) {
    if (event.altKey)
        name = "Alt-" + name;
    if (event.ctrlKey)
        name = "Ctrl-" + name;
    if (event.metaKey)
        name = "Meta-" + name;
    if (shift !== false && event.shiftKey)
        name = "Shift-" + name;
    return name;
}
const handleKeyEvents = editorview/* EditorView.domEventHandlers */.t.domEventHandlers({
    keydown(event, view) {
        return runHandlers(getKeymap(view.state), event, view, "editor");
    }
});
/**
 * Facet used for registering keymaps.
 *
 * You can add multiple keymaps to an editor. Their priorities determine their precedence (the
 * ones specified early or with high priority get checked first). When a handler has returned
 * `true` for a given key, no further handlers are called.
 */
const keymap = dist_state/* Facet.define */.r$.define({ enables: handleKeyEvents });
const Keymaps = new WeakMap();
/** This is hidden behind an indirection, rather than directly computed by the facet, to keep internal types out of the facet's type. */
function getKeymap(state) {
    let bindings = state.facet(keymap);
    let map = Keymaps.get(bindings);
    if (!map)
        Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
    return map;
}
/** Run the key handlers registered for a given scope. The event object should be a `"keydown"` event. Returns true if any of the handlers handled it. */
function runScopeHandlers(view, event, scope) {
    return runHandlers(getKeymap(view.state), event, view, scope);
}
let storedPrefix = null;
const PrefixTimeout = 4000;
function buildKeymap(bindings, platform = currentPlatform) {
    let bound = Object.create(null);
    let isPrefix = Object.create(null);
    let checkPrefix = (name, is) => {
        let current = isPrefix[name];
        if (current == null)
            isPrefix[name] = is;
        else if (current != is)
            throw new Error("Key binding " + name + " is used both as a regular binding and as a multi-stroke prefix");
    };
    let add = (scope, key, command, preventDefault) => {
        let scopeObj = bound[scope] || (bound[scope] = Object.create(null));
        let parts = key.split(/ (?!$)/).map(k => normalizeKeyName(k, platform));
        for (let i = 1; i < parts.length; i++) {
            let prefix = parts.slice(0, i).join(" ");
            checkPrefix(prefix, true);
            if (!scopeObj[prefix])
                scopeObj[prefix] = {
                    preventDefault: true,
                    commands: [(view) => {
                            let ourObj = storedPrefix = { view, prefix, scope };
                            setTimeout(() => { if (storedPrefix == ourObj)
                                storedPrefix = null; }, PrefixTimeout);
                            return true;
                        }]
                };
        }
        let full = parts.join(" ");
        checkPrefix(full, false);
        let binding = scopeObj[full] || (scopeObj[full] = { preventDefault: false, commands: [] });
        binding.commands.push(command);
        if (preventDefault)
            binding.preventDefault = true;
    };
    for (let b of bindings) {
        let name = b[platform] || b.key;
        if (!name)
            continue;
        for (let scope of b.scope ? b.scope.split(" ") : ["editor"]) {
            add(scope, name, b.run, b.preventDefault);
            if (b.shift)
                add(scope, "Shift-" + name, b.shift, b.preventDefault);
        }
    }
    return bound;
}
function runHandlers(map, event, view, scope) {
    let name = keyName(event), isChar = name.length == 1 && name != " ";
    let prefix = "", fallthrough = false;
    if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
        prefix = storedPrefix.prefix + " ";
        if (fallthrough = input/* modifierCodes.indexOf */.d.indexOf(event.keyCode) < 0)
            storedPrefix = null;
    }
    let runFor = (binding) => {
        if (binding) {
            for (let cmd of binding.commands)
                if (cmd(view))
                    return true;
            if (binding.preventDefault)
                fallthrough = true;
        }
        return false;
    };
    let scopeObj = map[scope], baseName;
    if (scopeObj) {
        if (runFor(scopeObj[prefix + modifiers(name, event, !isChar)]))
            return true;
        if (isChar && (event.shiftKey || event.altKey || event.metaKey) && (baseName = base[event.keyCode]) && baseName != name) {
            if (runFor(scopeObj[prefix + modifiers(baseName, event, true)]))
                return true;
        }
        else if (isChar && event.shiftKey) {
            if (runFor(scopeObj[prefix + modifiers(name, event, true)]))
                return true;
        }
    }
    return fallthrough;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/draw-selection.js






const CanHidePrimary = !browser/* default.ios */.Z.ios; // FIXME test IE
const selectionConfig = dist_state/* Facet.define */.r$.define({
    combine(configs) {
        return (0,dist_state/* combineConfig */.BO)(configs, {
            cursorBlinkRate: 1200,
            drawRangeCursor: true
        }, {
            cursorBlinkRate: (a, b) => Math.min(a, b),
            drawRangeCursor: (a, b) => a || b
        });
    }
});
/**
 * Returns an extension that hides the browser's native selection and cursor, replacing the selection
 * with a background behind the text (with the `cm-selectionBackground` class), and the cursors with
 * elements overlaid over the code (using `cm-cursor-primary` and `cm-cursor-secondary`).
 *
 * This allows the editor to display secondary selection ranges, and tends to produce a type of
 * selection more in line with that users expect in a text editor (the native selection styling will
 * often leave gaps between lines and won't fill the horizontal space after a line when the selection
 * continues past it).
 *
 * It does have a performance cost, in that it requires an extra DOM layout cycle for many updates
 * (the selection is drawn based on DOM layout information that's only available after laying out the
 * content).
 */
function drawSelection(config = {}) {
    return [
        selectionConfig.of(config),
        drawSelectionPlugin,
        hideNativeSelection
    ];
}
class Piece {
    constructor(left, top, width, height, className) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.className = className;
    }
    draw() {
        let elt = document.createElement("div");
        elt.className = this.className;
        this.adjust(elt);
        return elt;
    }
    adjust(elt) {
        elt.style.left = this.left + "px";
        elt.style.top = this.top + "px";
        if (this.width >= 0)
            elt.style.width = this.width + "px";
        elt.style.height = this.height + "px";
    }
    eq(p) {
        return this.left == p.left && this.top == p.top && this.width == p.width && this.height == p.height &&
            this.className == p.className;
    }
}
const drawSelectionPlugin = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.view = view;
        this.rangePieces = [];
        this.cursors = [];
        this.measureReq = { read: this.readPos.bind(this), write: this.drawSel.bind(this) };
        this.selectionLayer = view.scrollDOM.appendChild(document.createElement("div"));
        this.selectionLayer.className = "cm-selectionLayer";
        this.selectionLayer.setAttribute("aria-hidden", "true");
        this.cursorLayer = view.scrollDOM.appendChild(document.createElement("div"));
        this.cursorLayer.className = "cm-cursorLayer";
        this.cursorLayer.setAttribute("aria-hidden", "true");
        view.requestMeasure(this.measureReq);
        this.setBlinkRate();
    }
    setBlinkRate() {
        this.cursorLayer.style.animationDuration = this.view.state.facet(selectionConfig).cursorBlinkRate + "ms";
    }
    update(update) {
        let confChanged = update.startState.facet(selectionConfig) != update.state.facet(selectionConfig);
        if (confChanged || update.selectionSet || update.geometryChanged || update.viewportChanged)
            this.view.requestMeasure(this.measureReq);
        if (update.transactions.some(tr => tr.scrollIntoView))
            this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
        if (confChanged)
            this.setBlinkRate();
    }
    readPos() {
        let { state } = this.view, conf = state.facet(selectionConfig);
        let rangePieces = state.selection.ranges.map(r => r.empty ? [] : measureRange(this.view, r)).reduce((a, b) => a.concat(b));
        let cursors = [];
        for (let r of state.selection.ranges) {
            let prim = r == state.selection.main;
            if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
                let piece = measureCursor(this.view, r, prim);
                if (piece)
                    cursors.push(piece);
            }
        }
        return { rangePieces, cursors };
    }
    drawSel({ rangePieces, cursors }) {
        if (rangePieces.length != this.rangePieces.length || rangePieces.some((p, i) => !p.eq(this.rangePieces[i]))) {
            this.selectionLayer.textContent = "";
            for (let p of rangePieces)
                this.selectionLayer.appendChild(p.draw());
            this.rangePieces = rangePieces;
        }
        if (cursors.length != this.cursors.length || cursors.some((c, i) => !c.eq(this.cursors[i]))) {
            let oldCursors = this.cursorLayer.children;
            if (oldCursors.length !== cursors.length) {
                this.cursorLayer.textContent = "";
                for (const c of cursors)
                    this.cursorLayer.appendChild(c.draw());
            }
            else {
                cursors.forEach((c, idx) => c.adjust(oldCursors[idx]));
            }
            this.cursors = cursors;
        }
    }
    destroy() {
        this.selectionLayer.remove();
        this.cursorLayer.remove();
    }
});
const themeSpec = {
    ".cm-line": {
        "& ::selection": { backgroundColor: "transparent !important" },
        "&::selection": { backgroundColor: "transparent !important" }
    }
};
if (CanHidePrimary)
    themeSpec[".cm-line"].caretColor = "transparent !important";
const hideNativeSelection = dist_state/* Prec.highest */.Wl.highest(editorview/* EditorView.theme */.t.theme(themeSpec));
function getBase(view) {
    let rect = view.scrollDOM.getBoundingClientRect();
    let left = view.textDirection == view_bidi/* Direction.LTR */.Nm.LTR ? rect.left : rect.right - view.scrollDOM.clientWidth;
    return { left: left - view.scrollDOM.scrollLeft, top: rect.top - view.scrollDOM.scrollTop };
}
function wrappedLine(view, pos, inside) {
    let range = dist_state/* EditorSelection.cursor */.jT.cursor(pos);
    return { from: Math.max(inside.from, view.moveToLineBoundary(range, false, true).from),
        to: Math.min(inside.to, view.moveToLineBoundary(range, true, true).from),
        type: decoration/* BlockType.Text */.kH.Text };
}
function blockAt(view, pos) {
    let line = view.lineBlockAt(pos);
    if (Array.isArray(line.type))
        for (let l of line.type) {
            if (l.to > pos || l.to == pos && (l.to == line.to || l.type == decoration/* BlockType.Text */.kH.Text))
                return l;
        }
    return line;
}
function measureRange(view, range) {
    if (range.to <= view.viewport.from || range.from >= view.viewport.to)
        return [];
    let from = Math.max(range.from, view.viewport.from), to = Math.min(range.to, view.viewport.to);
    let ltr = view.textDirection == view_bidi/* Direction.LTR */.Nm.LTR;
    let content = view.contentDOM, contentRect = content.getBoundingClientRect(), base = getBase(view);
    let lineStyle = window.getComputedStyle(content.firstChild);
    let leftSide = contentRect.left + parseInt(lineStyle.paddingLeft) + Math.min(0, parseInt(lineStyle.textIndent));
    let rightSide = contentRect.right - parseInt(lineStyle.paddingRight);
    let startBlock = blockAt(view, from), endBlock = blockAt(view, to);
    let visualStart = startBlock.type == decoration/* BlockType.Text */.kH.Text ? startBlock : null;
    let visualEnd = endBlock.type == decoration/* BlockType.Text */.kH.Text ? endBlock : null;
    if (view.lineWrapping) {
        if (visualStart)
            visualStart = wrappedLine(view, from, visualStart);
        if (visualEnd)
            visualEnd = wrappedLine(view, to, visualEnd);
    }
    if (visualStart && visualEnd && visualStart.from == visualEnd.from) {
        return pieces(drawForLine(range.from, range.to, visualStart));
    }
    else {
        let top = visualStart ? drawForLine(range.from, null, visualStart) : drawForWidget(startBlock, false);
        let bottom = visualEnd ? drawForLine(null, range.to, visualEnd) : drawForWidget(endBlock, true);
        let between = [];
        if ((visualStart || startBlock).to < (visualEnd || endBlock).from - 1)
            between.push(piece(leftSide, top.bottom, rightSide, bottom.top));
        else if (top.bottom < bottom.top && view.elementAtHeight((top.bottom + bottom.top) / 2).type == decoration/* BlockType.Text */.kH.Text)
            top.bottom = bottom.top = (top.bottom + bottom.top) / 2;
        return pieces(top).concat(between).concat(pieces(bottom));
    }
    function piece(left, top, right, bottom) {
        return new Piece(left - base.left, top - base.top - 0.01 /* Epsilon */, right - left, bottom - top + 0.01 /* Epsilon */, "cm-selectionBackground");
    }
    function pieces({ top, bottom, horizontal }) {
        let pieces = [];
        for (let i = 0; i < horizontal.length; i += 2)
            pieces.push(piece(horizontal[i], top, horizontal[i + 1], bottom));
        return pieces;
    }
    // Gets passed from/to in line-local positions
    function drawForLine(from, to, line) {
        let top = 1e9, bottom = -1e9, horizontal = [];
        function addSpan(from, fromOpen, to, toOpen, dir) {
            // Passing 2/-2 is a kludge to force the view to return
            // coordinates on the proper side of block widgets, since
            // normalizing the side there, though appropriate for most
            // coordsAtPos queries, would break selection drawing.
            let fromCoords = view.coordsAtPos(from, (from == line.to ? -2 : 2));
            let toCoords = view.coordsAtPos(to, (to == line.from ? 2 : -2));
            top = Math.min(fromCoords.top, toCoords.top, top);
            bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
            if (dir == view_bidi/* Direction.LTR */.Nm.LTR)
                horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
            else
                horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
        }
        let start = from !== null && from !== void 0 ? from : line.from, end = to !== null && to !== void 0 ? to : line.to;
        // Split the range by visible range and document line
        for (let r of view.visibleRanges)
            if (r.to > start && r.from < end) {
                for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end);;) {
                    let docLine = view.state.doc.lineAt(pos);
                    for (let span of view.bidiSpans(docLine)) {
                        let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
                        if (spanFrom >= endPos)
                            break;
                        if (spanTo > pos)
                            addSpan(Math.max(spanFrom, pos), from == null && spanFrom <= start, Math.min(spanTo, endPos), to == null && spanTo >= end, span.dir);
                    }
                    pos = docLine.to + 1;
                    if (pos >= endPos)
                        break;
                }
            }
        if (horizontal.length == 0)
            addSpan(start, from == null, end, to == null, view.textDirection);
        return { top, bottom, horizontal };
    }
    function drawForWidget(block, top) {
        let y = contentRect.top + (top ? block.top : block.bottom);
        return { top: y, bottom: y, horizontal: [] };
    }
}
function measureCursor(view, cursor, primary) {
    let pos = view.coordsAtPos(cursor.head, cursor.assoc || 1);
    if (!pos)
        return null;
    let base = getBase(view);
    return new Piece(pos.left - base.left, pos.top - base.top, -1, pos.bottom - pos.top, primary ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary");
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/dropcursor.js


const setDropCursorPos = dist_state/* StateEffect.define */.Py.define({
    map(pos, mapping) { return pos == null ? null : mapping.mapPos(pos); }
});
const dropCursorPos = dist_state/* StateField.define */.QQ.define({
    create() { return null; },
    update(pos, tr) {
        if (pos != null)
            pos = tr.changes.mapPos(pos);
        return tr.effects.reduce((pos, e) => e.is(setDropCursorPos) ? e.value : pos, pos);
    }
});
const drawDropCursor = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.view = view;
        this.cursor = null;
        this.measureReq = { read: this.readPos.bind(this), write: this.drawCursor.bind(this) };
    }
    update(update) {
        var _a;
        let cursorPos = update.state.field(dropCursorPos);
        if (cursorPos == null) {
            if (this.cursor != null) {
                (_a = this.cursor) === null || _a === void 0 ? void 0 : _a.remove();
                this.cursor = null;
            }
        }
        else {
            if (!this.cursor) {
                this.cursor = this.view.scrollDOM.appendChild(document.createElement("div"));
                this.cursor.className = "cm-dropCursor";
            }
            if (update.startState.field(dropCursorPos) != cursorPos || update.docChanged || update.geometryChanged)
                this.view.requestMeasure(this.measureReq);
        }
    }
    readPos() {
        let pos = this.view.state.field(dropCursorPos);
        let rect = pos != null && this.view.coordsAtPos(pos);
        if (!rect)
            return null;
        let outer = this.view.scrollDOM.getBoundingClientRect();
        return {
            left: rect.left - outer.left + this.view.scrollDOM.scrollLeft,
            top: rect.top - outer.top + this.view.scrollDOM.scrollTop,
            height: rect.bottom - rect.top
        };
    }
    drawCursor(pos) {
        if (this.cursor) {
            if (pos) {
                this.cursor.style.left = pos.left + "px";
                this.cursor.style.top = pos.top + "px";
                this.cursor.style.height = pos.height + "px";
            }
            else {
                this.cursor.style.left = "-100000px";
            }
        }
    }
    destroy() {
        if (this.cursor)
            this.cursor.remove();
    }
    setDropPos(pos) {
        if (this.view.state.field(dropCursorPos) != pos)
            this.view.dispatch({ effects: setDropCursorPos.of(pos) });
    }
}, {
    eventHandlers: {
        dragover(event) {
            this.setDropPos(this.view.posAtCoords({ x: event.clientX, y: event.clientY }));
        },
        dragleave(event) {
            if (event.target == this.view.contentDOM || !this.view.contentDOM.contains(event.relatedTarget))
                this.setDropPos(null);
        },
        dragend() {
            this.setDropPos(null);
        },
        drop() {
            this.setDropPos(null);
        }
    }
});
/** Draws a cursor at the current drop position when something is dragged over the editor. */
function dropCursor() {
    return [dropCursorPos, drawDropCursor];
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/matchdecorator.js

function iterMatches(doc, re, from, to, func) {
    re.lastIndex = 0;
    for (let cursor = doc.iterRange(from, to), pos = from, m; !cursor.next().done; pos += cursor.value.length) {
        if (!cursor.lineBreak)
            while (m = re.exec(cursor.value))
                func(pos + m.index, pos + m.index + m[0].length, m);
    }
}
function matchRanges(view, maxLength) {
    let visible = view.visibleRanges;
    if (visible.length == 1 && visible[0].from == view.viewport.from && visible[0].to == view.viewport.to)
        return visible;
    let result = [];
    for (let { from, to } of visible) {
        from = Math.max(view.state.doc.lineAt(from).from, from - maxLength);
        to = Math.min(view.state.doc.lineAt(to).to, to + maxLength);
        if (result.length && result[result.length - 1].to >= from)
            result[result.length - 1].to = to;
        else
            result.push({ from, to });
    }
    return result;
}
/**
 * Helper class used to make it easier to maintain decorations on visible code that matches a
 * given regular expression. To be used in a [view plugin]{@link ViewPlugin}. Instances of this
 * object represent a matching configuration.
 */
class MatchDecorator {
    /**
     * Create a decorator.
     * @param config.regexp The regular expression to match against the content. Will only be matched
     *                      inside lines (not across them). Should have its 'g' flag set.
     * @param config.decoration The decoration to apply to matches, either directly or as a function
     *                      of the match.
     * @param config.boundary By default, changed lines are re-matched entirely. You can provide a
     *                      boundary expression,which should match single character strings that can
     *                      never occur in `regexp`, to reducethe amount of re-matching.
     * @param config.maxLength Matching happens by line, by default, but when lines are folded or very
     *                      long lines are onlypartially drawn, the decorator may avoid matching part
     *                      of them for speed. This controls howmuch additional invisible content it
     *                      should include in its matches. Defaults to 1000.
     */
    constructor(config) {
        let { regexp, decoration, boundary, maxLength = 1000 } = config;
        if (!regexp.global)
            throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
        this.regexp = regexp;
        this.getDeco = typeof decoration == "function" ? decoration : () => decoration;
        this.boundary = boundary;
        this.maxLength = maxLength;
    }
    /**
     * Compute the full set of decorations for matches in the given view's viewport. You'll want to call
     * this when initializing your plugin.
     */
    createDeco(view) {
        let build = new dist_state/* RangeSetBuilder */.f_();
        for (let { from, to } of matchRanges(view, this.maxLength))
            iterMatches(view.state.doc, this.regexp, from, to, (a, b, m) => build.add(a, b, this.getDeco(m, view, a)));
        return build.finish();
    }
    /**
     * Update a set of decorations for a view update. `deco` _must_ be the set of decorations produced by
     * _this_ `MatchDecorator` for the view state before the update.
     */
    updateDeco(update, deco) {
        let changeFrom = 1e9, changeTo = -1;
        if (update.docChanged)
            update.changes.iterChanges((_f, _t, from, to) => {
                if (to > update.view.viewport.from && from < update.view.viewport.to) {
                    changeFrom = Math.min(from, changeFrom);
                    changeTo = Math.max(to, changeTo);
                }
            });
        if (update.viewportChanged || changeTo - changeFrom > 1000)
            return this.createDeco(update.view);
        if (changeTo > -1)
            return this.updateRange(update.view, deco.map(update.changes), changeFrom, changeTo);
        return deco;
    }
    updateRange(view, deco, updateFrom, updateTo) {
        for (let r of view.visibleRanges) {
            let from = Math.max(r.from, updateFrom), to = Math.min(r.to, updateTo);
            if (to > from) {
                let fromLine = view.state.doc.lineAt(from), toLine = fromLine.to < to ? view.state.doc.lineAt(to) : fromLine;
                let start = Math.max(r.from, fromLine.from), end = Math.min(r.to, toLine.to);
                if (this.boundary) {
                    for (; from > fromLine.from; from--)
                        if (this.boundary.test(fromLine.text[from - 1 - fromLine.from])) {
                            start = from;
                            break;
                        }
                    for (; to < toLine.to; to++)
                        if (this.boundary.test(toLine.text[to - toLine.from])) {
                            end = to;
                            break;
                        }
                }
                let ranges = [], m;
                if (fromLine == toLine) {
                    this.regexp.lastIndex = start - fromLine.from;
                    while ((m = this.regexp.exec(fromLine.text)) && m.index < end - fromLine.from) {
                        let pos = m.index + fromLine.from;
                        ranges.push(this.getDeco(m, view, pos).range(pos, pos + m[0].length));
                    }
                }
                else {
                    iterMatches(view.state.doc, this.regexp, start, end, (from, to, m) => ranges.push(this.getDeco(m, view, from).range(from, to)));
                }
                deco = deco.update({ filterFrom: start, filterTo: end, filter: (from, to) => from < start || to > end, add: ranges });
            }
        }
        return deco;
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/special-chars.js




const UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
const Specials = new RegExp("[\u0000-\u0008\u000a-\u001f\u007f-\u009f\u00ad\u061c\u200b\u200e\u200f\u2028\u2029\u202d\u202e\ufeff\ufff9-\ufffc]", UnicodeRegexpSupport);
const Names = {
    0: "null",
    7: "bell",
    8: "backspace",
    10: "newline",
    11: "vertical tab",
    13: "carriage return",
    27: "escape",
    8203: "zero width space",
    8204: "zero width non-joiner",
    8205: "zero width joiner",
    8206: "left-to-right mark",
    8207: "right-to-left mark",
    8232: "line separator",
    8237: "left-to-right override",
    8238: "right-to-left override",
    8233: "paragraph separator",
    65279: "zero width no-break space",
    65532: "object replacement"
};
let _supportsTabSize = null;
function supportsTabSize() {
    var _a;
    if (_supportsTabSize == null && typeof document != "undefined" && document.body) {
        let styles = document.body.style;
        _supportsTabSize = ((_a = styles.tabSize) !== null && _a !== void 0 ? _a : styles.MozTabSize) != null;
    }
    return _supportsTabSize || false;
}
const specialCharConfig = dist_state/* Facet.define */.r$.define({
    combine(configs) {
        let config = (0,dist_state/* combineConfig */.BO)(configs, {
            render: null,
            specialChars: Specials,
            addSpecialChars: null
        });
        if ((config.replaceTabs = !supportsTabSize()))
            config.specialChars = new RegExp("\t|" + config.specialChars.source, UnicodeRegexpSupport);
        if (config.addSpecialChars)
            config.specialChars = new RegExp(config.specialChars.source + "|" + config.addSpecialChars.source, UnicodeRegexpSupport);
        return config;
    }
});
/**
 * Returns an extension that installs highlighting of special characters.
 * @param config Configuration options.
 */
function highlightSpecialChars(config = {}) {
    return [specialCharConfig.of(config), specialCharPlugin()];
}
let _plugin = null;
function specialCharPlugin() {
    return _plugin || (_plugin = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
        constructor(view) {
            this.view = view;
            this.decorations = decoration/* Decoration.none */.p.none;
            this.decorationCache = Object.create(null);
            this.decorator = this.makeDecorator(view.state.facet(specialCharConfig));
            this.decorations = this.decorator.createDeco(view);
        }
        makeDecorator(conf) {
            return new MatchDecorator({
                regexp: conf.specialChars,
                decoration: (m, view, pos) => {
                    let { doc } = view.state;
                    let code = (0,dist_state/* codePointAt */.gm)(m[0], 0);
                    if (code == 9) {
                        let line = doc.lineAt(pos);
                        let size = view.state.tabSize, col = (0,dist_state/* countColumn */.IS)(line.text, size, pos - line.from);
                        return decoration/* Decoration.replace */.p.replace({ widget: new TabWidget((size - (col % size)) * this.view.defaultCharacterWidth) });
                    }
                    return this.decorationCache[code] ||
                        (this.decorationCache[code] = decoration/* Decoration.replace */.p.replace({ widget: new SpecialCharWidget(conf, code) }));
                },
                boundary: conf.replaceTabs ? undefined : /[^]/
            });
        }
        update(update) {
            let conf = update.state.facet(specialCharConfig);
            if (update.startState.facet(specialCharConfig) != conf) {
                this.decorator = this.makeDecorator(conf);
                this.decorations = this.decorator.createDeco(update.view);
            }
            else {
                this.decorations = this.decorator.updateDeco(update, this.decorations);
            }
        }
    }, {
        decorations: v => v.decorations
    }));
}
const DefaultPlaceholder = "\u2022";
// Assigns placeholder characters from the Control Pictures block to ASCII control characters
function placeholder(code) {
    if (code >= 32)
        return DefaultPlaceholder;
    if (code == 10)
        return "\u2424";
    return String.fromCharCode(9216 + code);
}
class SpecialCharWidget extends decoration/* WidgetType */.l9 {
    constructor(options, code) {
        super();
        this.options = options;
        this.code = code;
    }
    eq(other) { return other.code == this.code; }
    toDOM(view) {
        let ph = placeholder(this.code);
        let desc = view.state.phrase("Control character") + " " + (Names[this.code] || "0x" + this.code.toString(16));
        let custom = this.options.render && this.options.render(this.code, desc, ph);
        if (custom)
            return custom;
        let span = document.createElement("span");
        span.textContent = ph;
        span.title = desc;
        span.setAttribute("aria-label", desc);
        span.className = "cm-specialChar";
        return span;
    }
    ignoreEvent() { return false; }
}
class TabWidget extends decoration/* WidgetType */.l9 {
    constructor(width) {
        super();
        this.width = width;
    }
    eq(other) { return other.width == this.width; }
    toDOM() {
        let span = document.createElement("span");
        span.textContent = "\t";
        span.className = "cm-tab";
        span.style.width = this.width + "px";
        return span;
    }
    ignoreEvent() { return false; }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/scrollpastend.js

const scrollpastend_plugin = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor() {
        this.height = 1000;
        this.attrs = { style: "padding-bottom: 1000px" };
    }
    update(update) {
        let height = update.view.viewState.editorHeight - update.view.defaultLineHeight;
        if (height != this.height) {
            this.height = height;
            this.attrs = { style: `padding-bottom: ${height}px` };
        }
    }
});
/**
 * Returns an extension that makes sure the content has a bottom margin equivalent to the
 * height of the editor, minus one line height, so that every line in the document can be
 * scrolled to the top of the editor.
 *
 * This is only meaningful when the editor is scrollable, and should not be enabled in editors
 * that take the size of their content.
 */
function scrollPastEnd() {
    return [scrollpastend_plugin, contentAttributes.of(view => { var _a; return ((_a = view.plugin(scrollpastend_plugin)) === null || _a === void 0 ? void 0 : _a.attrs) || null; })];
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/active-line.js


/** Mark lines that have a cursor on them with the `"cm-activeLine"` DOM class. */
function highlightActiveLine() {
    return activeLineHighlighter;
}
const lineDeco = decoration/* Decoration.line */.p.line({ class: "cm-activeLine" });
const activeLineHighlighter = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.decorations = this.getDeco(view);
    }
    update(update) {
        if (update.docChanged || update.selectionSet)
            this.decorations = this.getDeco(update.view);
    }
    getDeco(view) {
        let lastLineStart = -1, deco = [];
        for (let r of view.state.selection.ranges) {
            if (!r.empty)
                return decoration/* Decoration.none */.p.none;
            let line = view.lineBlockAt(r.head);
            if (line.from > lastLineStart) {
                deco.push(lineDeco.range(line.from));
                lastLineStart = line.from;
            }
        }
        return decoration/* Decoration.set */.p.set(deco);
    }
}, {
    decorations: v => v.decorations
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/placeholder.js


class Placeholder extends (/* unused pure expression or super */ null && (WidgetType)) {
    constructor(content) {
        super();
        this.content = content;
    }
    toDOM() {
        let wrap = document.createElement("span");
        wrap.className = "cm-placeholder";
        wrap.style.pointerEvents = "none";
        wrap.appendChild(typeof this.content == "string" ? document.createTextNode(this.content) : this.content);
        if (typeof this.content == "string")
            wrap.setAttribute("aria-label", "placeholder " + this.content);
        else
            wrap.setAttribute("aria-hidden", "true");
        return wrap;
    }
    ignoreEvent() { return false; }
}
/** Extension that enables a placeholder—a piece of example content to show when the editor is empty. */
function placeholder_placeholder(content) {
    return ViewPlugin.fromClass(class {
        constructor(view) {
            this.view = view;
            this.placeholder = Decoration.set([Decoration.widget({ widget: new Placeholder(content), side: 1 }).range(0)]);
        }
        get decorations() { return this.view.state.doc.length ? Decoration.none : this.placeholder; }
    }, { decorations: v => v.decorations });
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/rectangular-selection.js



// Don't compute precise column positions for line offsets above this (since it could get expensive). Assume offset==column for them.
const MaxOff = 2000;
function rectangleFor(state, a, b) {
    let startLine = Math.min(a.line, b.line), endLine = Math.max(a.line, b.line);
    let ranges = [];
    if (a.off > MaxOff || b.off > MaxOff || a.col < 0 || b.col < 0) {
        let startOff = Math.min(a.off, b.off), endOff = Math.max(a.off, b.off);
        for (let i = startLine; i <= endLine; i++) {
            let line = state.doc.line(i);
            if (line.length <= endOff)
                ranges.push(dist_state/* EditorSelection.range */.jT.range(line.from + startOff, line.to + endOff));
        }
    }
    else {
        let startCol = Math.min(a.col, b.col), endCol = Math.max(a.col, b.col);
        for (let i = startLine; i <= endLine; i++) {
            let line = state.doc.line(i);
            let start = (0,dist_state/* findColumn */.Gz)(line.text, startCol, state.tabSize, true);
            if (start > -1) {
                let end = (0,dist_state/* findColumn */.Gz)(line.text, endCol, state.tabSize);
                ranges.push(dist_state/* EditorSelection.range */.jT.range(line.from + start, line.from + end));
            }
        }
    }
    return ranges;
}
function absoluteColumn(view, x) {
    let ref = view.coordsAtPos(view.viewport.from);
    return ref ? Math.round(Math.abs((ref.left - x) / view.defaultCharacterWidth)) : -1;
}
function getPos(view, event) {
    let offset = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    let line = view.state.doc.lineAt(offset), off = offset - line.from;
    let col = off > MaxOff ? -1 : off == line.length ?
        absoluteColumn(view, event.clientX) : (0,dist_state/* countColumn */.IS)(line.text, view.state.tabSize, offset - line.from);
    return { line: line.number, col, off };
}
function rectangleSelectionStyle(view, event) {
    let start = getPos(view, event), startSel = view.state.selection;
    if (!start)
        return null;
    return {
        update(update) {
            if (update.docChanged) {
                let newStart = update.changes.mapPos(update.startState.doc.line(start.line).from);
                let newLine = update.state.doc.lineAt(newStart);
                start = { line: newLine.number, col: start.col, off: Math.min(start.off, newLine.length) };
                startSel = startSel.map(update.changes);
            }
        },
        get(event, _extend, multiple) {
            let cur = getPos(view, event);
            if (!cur)
                return startSel;
            let ranges = rectangleFor(view.state, start, cur);
            if (!ranges.length)
                return startSel;
            if (multiple)
                return dist_state/* EditorSelection.create */.jT.create(ranges.concat(startSel.ranges));
            else
                return dist_state/* EditorSelection.create */.jT.create(ranges);
        }
    };
}
/**
 * Create an extension that enables rectangular selections. By default, it will react to left mouse
 * drag with the Alt key held down. When such a selection occurs, the text within the rectangle
 * that was dragged over will be selected, as one selection [range]{@link SelectionRange} per line.
 * @param options.eventFilter A custom predicate function, which takes a `mousedown` event and
 *                            returns true if it should be used for rectangular selection.
 */
function rectangularSelection(options) {
    let filter = (options === null || options === void 0 ? void 0 : options.eventFilter) || (e => e.altKey && e.button == 0);
    return editorview/* EditorView.mouseSelectionStyle.of */.t.mouseSelectionStyle.of((view, event) => filter(event) ? rectangleSelectionStyle(view, event) : null);
}
const keys = {
    Alt: [18, e => e.altKey],
    Control: [17, e => e.ctrlKey],
    Shift: [16, e => e.shiftKey],
    Meta: [91, e => e.metaKey]
};
const showCrosshair = { style: "cursor: crosshair" };
/**
 * Returns an extension that turns the pointer cursor into a crosshair when a given modifier key,
 * defaulting to Alt, is held down. Can serve as a visual hint that rectangular selection is
 * going to happen when paired with {@link rectangularSelection}.
 */
function crosshairCursor(options = {}) {
    let [code, getter] = keys[options.key || "Alt"];
    let plugin = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
        constructor(view) {
            this.view = view;
            this.isDown = false;
        }
        set(isDown) {
            if (this.isDown != isDown) {
                this.isDown = isDown;
                this.view.update([]);
            }
        }
    }, {
        eventHandlers: {
            keydown(e) {
                this.set(e.keyCode == code || getter(e));
            },
            keyup(e) {
                if (e.keyCode == code || !getter(e))
                    this.set(false);
            }
        }
    });
    return [
        plugin,
        editorview/* EditorView.contentAttributes.of */.t.contentAttributes.of(view => { var _a; return ((_a = view.plugin(plugin)) === null || _a === void 0 ? void 0 : _a.isDown) ? showCrosshair : null; })
    ];
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/tooltip.js





const Outside = "-10000px";
class TooltipViewManager {
    constructor(view, facet, createTooltipView) {
        this.facet = facet;
        this.createTooltipView = createTooltipView;
        this.input = view.state.facet(facet);
        this.tooltips = this.input.filter(t => t);
        this.tooltipViews = this.tooltips.map(createTooltipView);
    }
    update(update) {
        let input = update.state.facet(this.facet);
        let tooltips = input.filter(x => x);
        if (input === this.input) {
            for (let t of this.tooltipViews)
                if (t.update)
                    t.update(update);
            return false;
        }
        let tooltipViews = [];
        for (let i = 0; i < tooltips.length; i++) {
            let tip = tooltips[i], known = -1;
            if (!tip)
                continue;
            for (let i = 0; i < this.tooltips.length; i++) {
                let other = this.tooltips[i];
                if (other && other.create == tip.create)
                    known = i;
            }
            if (known < 0) {
                tooltipViews[i] = this.createTooltipView(tip);
            }
            else {
                let tooltipView = tooltipViews[i] = this.tooltipViews[known];
                if (tooltipView.update)
                    tooltipView.update(update);
            }
        }
        for (let t of this.tooltipViews)
            if (tooltipViews.indexOf(t) < 0)
                t.dom.remove();
        this.input = input;
        this.tooltips = tooltips;
        this.tooltipViews = tooltipViews;
        return true;
    }
}
/**
 * Creates an extension that configures tooltip behavior.
 * @param [config.position] By default, tooltips use `"fixed"` [positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/position),
 *              which has the advantage that tooltips don't get cut off by scrollable parent elements.
 *              However, CSS rules like `contain: layout` can break fixed positioning in child nodes,
 *              which can be worked about by using `"absolute"` here.
 *
 *              On iOS, which at the time of writing still doesn't properly support fixed positioning,
 *              the library always uses absolute positioning.
 * @param [config.parent] The element to put the tooltips into. By default, they are put in the editor
 *              (`cm-editor`) element, and that is usually what you want. But in some layouts that can
 *              lead to positioning issues, and you need to use a different parent to work around those.
 * @param [config.tooltipSpace] By default, when figuring out whether there is room for a tooltip at a
 *              given position, the extension considers the entire space between 0,0 and `innerWidth`,
 *              `innerHeight` to be available for showing tooltips. You can provide a function here that
 *              returns an alternative rectangle.
 */
function tooltips(config = {}) {
    return tooltipConfig.of(config);
}
function windowSpace() {
    return { top: 0, left: 0, bottom: innerHeight, right: innerWidth };
}
const tooltipConfig = dist_state/* Facet.define */.r$.define({
    combine: values => {
        var _a, _b, _c;
        return ({
            position: browser/* default.ios */.Z.ios ? "absolute" : ((_a = values.find(conf => conf.position)) === null || _a === void 0 ? void 0 : _a.position) || "fixed",
            parent: ((_b = values.find(conf => conf.parent)) === null || _b === void 0 ? void 0 : _b.parent) || null,
            tooltipSpace: ((_c = values.find(conf => conf.tooltipSpace)) === null || _c === void 0 ? void 0 : _c.tooltipSpace) || windowSpace,
        });
    }
});
const tooltipPlugin = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        var _a;
        this.view = view;
        this.inView = true;
        this.lastTransaction = 0;
        this.measureTimeout = -1;
        let config = view.state.facet(tooltipConfig);
        this.position = config.position;
        this.parent = config.parent;
        this.classes = view.themeClasses;
        this.createContainer();
        this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
        this.manager = new TooltipViewManager(view, showTooltip, t => this.createTooltip(t));
        this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver(entries => {
            if (Date.now() > this.lastTransaction - 50 && entries.length > 0 && entries[entries.length - 1].intersectionRatio < 1)
                this.measureSoon();
        }, { threshold: [1] }) : null;
        this.observeIntersection();
        (_a = view.dom.ownerDocument.defaultView) === null || _a === void 0 ? void 0 : _a.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this));
        this.maybeMeasure();
    }
    createContainer() {
        if (this.parent) {
            this.container = document.createElement("div");
            this.container.style.position = "relative";
            this.container.className = this.view.themeClasses;
            this.parent.appendChild(this.container);
        }
        else {
            this.container = this.view.dom;
        }
    }
    observeIntersection() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            for (let tooltip of this.manager.tooltipViews)
                this.intersectionObserver.observe(tooltip.dom);
        }
    }
    measureSoon() {
        if (this.measureTimeout < 0)
            this.measureTimeout = setTimeout(() => {
                this.measureTimeout = -1;
                this.maybeMeasure();
            }, 50);
    }
    update(update) {
        if (update.transactions.length)
            this.lastTransaction = Date.now();
        let updated = this.manager.update(update);
        if (updated)
            this.observeIntersection();
        let shouldMeasure = updated || update.geometryChanged;
        let newConfig = update.state.facet(tooltipConfig);
        if (newConfig.position != this.position) {
            this.position = newConfig.position;
            for (let t of this.manager.tooltipViews)
                t.dom.style.position = this.position;
            shouldMeasure = true;
        }
        if (newConfig.parent != this.parent) {
            if (this.parent)
                this.container.remove();
            this.parent = newConfig.parent;
            this.createContainer();
            for (let t of this.manager.tooltipViews)
                this.container.appendChild(t.dom);
            shouldMeasure = true;
        }
        else if (this.parent && this.view.themeClasses != this.classes) {
            this.classes = this.container.className = this.view.themeClasses;
        }
        if (shouldMeasure)
            this.maybeMeasure();
    }
    createTooltip(tooltip) {
        let tooltipView = tooltip.create(this.view);
        tooltipView.dom.classList.add("cm-tooltip");
        if (tooltip.arrow && !tooltipView.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
            let arrow = document.createElement("div");
            arrow.className = "cm-tooltip-arrow";
            tooltipView.dom.appendChild(arrow);
        }
        tooltipView.dom.style.position = this.position;
        tooltipView.dom.style.top = Outside;
        this.container.appendChild(tooltipView.dom);
        if (tooltipView.mount)
            tooltipView.mount(this.view);
        return tooltipView;
    }
    destroy() {
        var _a, _b;
        (_a = this.view.dom.ownerDocument.defaultView) === null || _a === void 0 ? void 0 : _a.removeEventListener("resize", this.measureSoon);
        for (let { dom } of this.manager.tooltipViews)
            dom.remove();
        (_b = this.intersectionObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
        clearTimeout(this.measureTimeout);
    }
    readMeasure() {
        let editor = this.view.dom.getBoundingClientRect();
        return {
            editor,
            parent: this.parent ? this.container.getBoundingClientRect() : editor,
            pos: this.manager.tooltips.map((t, i) => {
                let tv = this.manager.tooltipViews[i];
                return tv.getCoords ? tv.getCoords(t.pos) : this.view.coordsAtPos(t.pos);
            }),
            size: this.manager.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
            space: this.view.state.facet(tooltipConfig).tooltipSpace(this.view),
        };
    }
    writeMeasure(measured) {
        let { editor, space } = measured;
        let others = [];
        for (let i = 0; i < this.manager.tooltips.length; i++) {
            let tooltip = this.manager.tooltips[i], tView = this.manager.tooltipViews[i], { dom } = tView;
            let pos = measured.pos[i], size = measured.size[i];
            // Hide tooltips that are outside of the editor.
            if (!pos || pos.bottom <= Math.max(editor.top, space.top) || pos.top >= Math.min(editor.bottom, space.bottom) ||
                pos.right < Math.max(editor.left, space.left) - .1 || pos.left > Math.min(editor.right, space.right) + .1) {
                dom.style.top = Outside;
                continue;
            }
            let arrow = tooltip.arrow ? tView.dom.querySelector(".cm-tooltip-arrow") : null;
            let arrowHeight = arrow ? 7 /* Size */ : 0;
            let width = size.right - size.left, height = size.bottom - size.top;
            let offset = tView.offset || noOffset, ltr = this.view.textDirection == view_bidi/* Direction.LTR */.Nm.LTR;
            let left = size.width > space.right - space.left ? (ltr ? space.left : space.right - size.width) :
                ltr ? Math.min(pos.left - (arrow ? 14 /* Offset */ : 0) + offset.x, space.right - width) : Math.max(space.left, pos.left - width + (arrow ? 14 /* Offset */ : 0) - offset.x);
            let above = !!tooltip.above;
            if (!tooltip.strictSide && (above ?
                pos.top - (size.bottom - size.top) - offset.y < space.top :
                pos.bottom + (size.bottom - size.top) + offset.y > space.bottom) &&
                above == (space.bottom - pos.bottom > pos.top - space.top))
                above = !above;
            let top = above ? pos.top - height - arrowHeight - offset.y : pos.bottom + arrowHeight + offset.y;
            let right = left + width;
            if (tView.overlap !== true)
                for (let r of others)
                    if (r.left < right && r.right > left && r.top < top + height && r.bottom > top)
                        top = above ? r.top - height - 2 - arrowHeight : r.bottom + arrowHeight + 2;
            if (this.position == "absolute") {
                dom.style.top = (top - measured.parent.top) + "px";
                dom.style.left = (left - measured.parent.left) + "px";
            }
            else {
                dom.style.top = top + "px";
                dom.style.left = left + "px";
            }
            if (arrow)
                arrow.style.left = `${pos.left + (ltr ? offset.x : -offset.x) - (left + 14 /* Offset */ - 7 /* Size */)}px`;
            if (tView.overlap !== true)
                others.push({ left, top, right, bottom: top + height });
            dom.classList.toggle("cm-tooltip-above", above);
            dom.classList.toggle("cm-tooltip-below", !above);
            if (tView.positioned)
                tView.positioned();
        }
    }
    maybeMeasure() {
        if (this.manager.tooltips.length) {
            if (this.view.inView)
                this.view.requestMeasure(this.measureReq);
            if (this.inView != this.view.inView) {
                this.inView = this.view.inView;
                if (!this.inView)
                    for (let tv of this.manager.tooltipViews)
                        tv.dom.style.top = Outside;
            }
        }
    }
}, {
    eventHandlers: {
        scroll() { this.maybeMeasure(); }
    }
});
const baseTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-tooltip": {
        zIndex: 100
    },
    "&light .cm-tooltip": {
        border: "1px solid #bbb",
        backgroundColor: "#f5f5f5"
    },
    "&light .cm-tooltip-section:not(:first-child)": {
        borderTop: "1px solid #bbb",
    },
    "&dark .cm-tooltip": {
        backgroundColor: "#333338",
        color: "white"
    },
    ".cm-tooltip-arrow": {
        height: `${7 /* Size */}px`,
        width: `${7 /* Size */ * 2}px`,
        position: "absolute",
        zIndex: -1,
        overflow: "hidden",
        "&:before, &:after": {
            content: "''",
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: `${7 /* Size */}px solid transparent`,
            borderRight: `${7 /* Size */}px solid transparent`,
        },
        ".cm-tooltip-above &": {
            bottom: `-${7 /* Size */}px`,
            "&:before": {
                borderTop: `${7 /* Size */}px solid #bbb`,
            },
            "&:after": {
                borderTop: `${7 /* Size */}px solid #f5f5f5`,
                bottom: "1px"
            }
        },
        ".cm-tooltip-below &": {
            top: `-${7 /* Size */}px`,
            "&:before": {
                borderBottom: `${7 /* Size */}px solid #bbb`,
            },
            "&:after": {
                borderBottom: `${7 /* Size */}px solid #f5f5f5`,
                top: "1px"
            }
        },
    },
    "&dark .cm-tooltip .cm-tooltip-arrow": {
        "&:before": {
            borderTopColor: "#333338",
            borderBottomColor: "#333338"
        },
        "&:after": {
            borderTopColor: "transparent",
            borderBottomColor: "transparent"
        }
    }
});
const noOffset = { x: 0, y: 0 };
/** Facet to which an extension can add a value to show a tooltip. */
const showTooltip = dist_state/* Facet.define */.r$.define({
    enables: [tooltipPlugin, baseTheme]
});
const showHoverTooltip = dist_state/* Facet.define */.r$.define();
class HoverTooltipHost {
    constructor(view) {
        this.view = view;
        this.mounted = false;
        this.dom = document.createElement("div");
        this.dom.classList.add("cm-tooltip-hover");
        this.manager = new TooltipViewManager(view, showHoverTooltip, t => this.createHostedView(t));
    }
    // Needs to be static so that host tooltip instances always match
    static create(view) {
        return new HoverTooltipHost(view);
    }
    createHostedView(tooltip) {
        let hostedView = tooltip.create(this.view);
        hostedView.dom.classList.add("cm-tooltip-section");
        this.dom.appendChild(hostedView.dom);
        if (this.mounted && hostedView.mount)
            hostedView.mount(this.view);
        return hostedView;
    }
    mount(view) {
        for (let hostedView of this.manager.tooltipViews) {
            if (hostedView.mount)
                hostedView.mount(view);
        }
        this.mounted = true;
    }
    positioned() {
        for (let hostedView of this.manager.tooltipViews) {
            if (hostedView.positioned)
                hostedView.positioned();
        }
    }
    update(update) {
        this.manager.update(update);
    }
}
const showHoverTooltipHost = showTooltip.compute([showHoverTooltip], state => {
    let tooltips = state.facet(showHoverTooltip).filter(t => t);
    if (tooltips.length === 0)
        return null;
    return {
        pos: Math.min(...tooltips.map(t => t.pos)),
        end: Math.max(...tooltips.filter(t => t.end != null).map(t => t.end)),
        create: HoverTooltipHost.create,
        above: tooltips[0].above,
        arrow: tooltips.some(t => t.arrow),
    };
});
class HoverPlugin {
    constructor(view, source, field, setHover, hoverTime) {
        this.view = view;
        this.source = source;
        this.field = field;
        this.setHover = setHover;
        this.hoverTime = hoverTime;
        this.hoverTimeout = -1;
        this.restartTimeout = -1;
        this.pending = null;
        this.lastMove = { x: 0, y: 0, target: view.dom, time: 0 };
        this.checkHover = this.checkHover.bind(this);
        view.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
        view.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
    }
    update() {
        if (this.pending) {
            this.pending = null;
            clearTimeout(this.restartTimeout);
            this.restartTimeout = setTimeout(() => this.startHover(), 20);
        }
    }
    get active() {
        return this.view.state.field(this.field);
    }
    checkHover() {
        this.hoverTimeout = -1;
        if (this.active)
            return;
        let hovered = Date.now() - this.lastMove.time;
        if (hovered < this.hoverTime)
            this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - hovered);
        else
            this.startHover();
    }
    startHover() {
        clearTimeout(this.restartTimeout);
        let { lastMove } = this;
        let pos = this.view.contentDOM.contains(lastMove.target) ? this.view.posAtCoords(lastMove) : null;
        if (pos == null)
            return;
        let posCoords = this.view.coordsAtPos(pos);
        if (posCoords == null || lastMove.y < posCoords.top || lastMove.y > posCoords.bottom ||
            lastMove.x < posCoords.left - this.view.defaultCharacterWidth ||
            lastMove.x > posCoords.right + this.view.defaultCharacterWidth)
            return;
        let bidi = this.view.bidiSpans(this.view.state.doc.lineAt(pos)).find(s => s.from <= pos && s.to >= pos);
        let rtl = bidi && bidi.dir == view_bidi/* Direction.RTL */.Nm.RTL ? -1 : 1;
        let open = this.source(this.view, pos, (lastMove.x < posCoords.left ? -rtl : rtl));
        if (open === null || open === void 0 ? void 0 : open.then) {
            let pending = this.pending = { pos };
            open.then(result => {
                if (this.pending == pending) {
                    this.pending = null;
                    if (result)
                        this.view.dispatch({ effects: this.setHover.of(result) });
                }
            }, e => (0,extension/* logException */.OO)(this.view.state, e, "hover tooltip"));
        }
        else if (open) {
            this.view.dispatch({ effects: this.setHover.of(open) });
        }
    }
    mousemove(event) {
        var _a;
        this.lastMove = { x: event.clientX, y: event.clientY, target: event.target, time: Date.now() };
        if (this.hoverTimeout < 0)
            this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime);
        let tooltip = this.active;
        if (tooltip && !isInTooltip(this.lastMove.target) || this.pending) {
            let { pos } = tooltip || this.pending, end = (_a = tooltip === null || tooltip === void 0 ? void 0 : tooltip.end) !== null && _a !== void 0 ? _a : pos;
            if ((pos == end ? this.view.posAtCoords(this.lastMove) != pos :
                !isOverRange(this.view, pos, end, event.clientX, event.clientY, 6 /* MaxDist */))) {
                this.view.dispatch({ effects: this.setHover.of(null) });
                this.pending = null;
            }
        }
    }
    mouseleave() {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = -1;
        if (this.active)
            this.view.dispatch({ effects: this.setHover.of(null) });
    }
    destroy() {
        clearTimeout(this.hoverTimeout);
        this.view.dom.removeEventListener("mouseleave", this.mouseleave);
        this.view.dom.removeEventListener("mousemove", this.mousemove);
    }
}
function isInTooltip(elt) {
    for (let cur = elt; cur; cur = cur.parentNode)
        if (cur.nodeType == 1 && cur.classList.contains("cm-tooltip"))
            return true;
    return false;
}
function isOverRange(view, from, to, x, y, margin) {
    let range = document.createRange();
    let fromDOM = view.domAtPos(from), toDOM = view.domAtPos(to);
    range.setEnd(toDOM.node, toDOM.offset);
    range.setStart(fromDOM.node, fromDOM.offset);
    let rects = range.getClientRects();
    range.detach();
    for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        let dist = Math.max(rect.top - y, y - rect.bottom, rect.left - x, x - rect.right);
        if (dist <= margin)
            return true;
    }
    return false;
}
/**
 * Set up a hover tooltip, which shows up when the pointer hovers over ranges of text. The callback
 * is called when the mouse hovers over the document text. It should, if there is a tooltip associated
 * with position `pos`, return the tooltip description (either directly or in a promise). The `side`
 * argument indicates on which side of the position the pointer is—it will be -1 if the pointer is
 * before the position, 1 if after the position.
 *
 * Note that all hover tooltips are hosted within a single tooltip container element. This allows
 * multiple tooltips over the same range to be "merged" together without overlapping.
 * @param options.hideOnChange When enabled (this defaults to false), close the tooltip whenever the document changes.
 * @param options.hoverTime Hover time after which the tooltip should appear, in milliseconds. Defaults to 300ms.
 */
function hoverTooltip(source, options = {}) {
    let setHover = dist_state/* StateEffect.define */.Py.define();
    let hoverState = dist_state/* StateField.define */.QQ.define({
        create() { return null; },
        update(value, tr) {
            if (value && (options.hideOnChange && (tr.docChanged || tr.selection) ||
                options.hideOn && options.hideOn(tr, value)))
                return null;
            if (value && tr.docChanged) {
                let newPos = tr.changes.mapPos(value.pos, -1, dist_state/* MapMode.TrackDel */.gc.TrackDel);
                if (newPos == null)
                    return null;
                let copy = Object.assign(Object.create(null), value);
                copy.pos = newPos;
                if (value.end != null)
                    copy.end = tr.changes.mapPos(value.end);
                value = copy;
            }
            for (let effect of tr.effects) {
                if (effect.is(setHover))
                    value = effect.value;
                if (effect.is(closeHoverTooltipEffect))
                    value = null;
            }
            return value;
        },
        provide: f => showHoverTooltip.from(f)
    });
    return [
        hoverState,
        extension/* ViewPlugin.define */.lg.define(view => new HoverPlugin(view, source, hoverState, setHover, options.hoverTime || 300 /* Time */)),
        showHoverTooltipHost
    ];
}
/** Get the active tooltip view for a given tooltip, if available. */
function getTooltip(view, tooltip) {
    let plugin = view.plugin(tooltipPlugin);
    if (!plugin)
        return null;
    let found = plugin.manager.tooltips.indexOf(tooltip);
    return found < 0 ? null : plugin.manager.tooltipViews[found];
}
/** Returns true if any hover tooltips are currently active. */
function hasHoverTooltips(state) {
    return state.facet(showHoverTooltip).some(x => x);
}
const closeHoverTooltipEffect = dist_state/* StateEffect.define */.Py.define();
/** Transaction effect that closes all hover tooltips. */
const closeHoverTooltips = closeHoverTooltipEffect.of(null);
/**
 * Tell the tooltip extension to recompute the position of the active tooltips. This can
 * be useful when something happens (such as a re-positioning or CSS change affecting the
 * editor) that could invalidate the existing tooltip positions.
 */
function repositionTooltips(view) {
    var _a;
    (_a = view.plugin(tooltipPlugin)) === null || _a === void 0 ? void 0 : _a.maybeMeasure();
}

// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/panel.js
var view_panel = __webpack_require__(443);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/gutter.js





/**
 * A gutter marker represents a bit of information attached to a line in a specific gutter.
 * Your own custom markers have to extend this class.
 */
class GutterMarker extends dist_state/* RangeValue */.uU {
    // @internal
    compare(other) {
        return this == other || this.constructor == other.constructor && this.eq(other);
    }
    /** Compare this marker to another marker of the same type. */
    eq(other) { return false; }
    /** Called if the marker has a `toDOM` method and its representation was removed from a gutter. */
    destroy(dom) { }
}
GutterMarker.prototype.elementClass = "";
GutterMarker.prototype.toDOM = undefined;
GutterMarker.prototype.mapMode = dist_state/* MapMode.TrackBefore */.gc.TrackBefore;
GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
GutterMarker.prototype.point = true;
/**
 * Facet used to add a class to all gutter elements for a given line. Markers given to this facet
 * should _only_ define an [`elementclass`]{@link GutterMarker.elementClass}, not a
 * [`toDOM`]{@link GutterMarker.toDOM} (or the marker will appear in all gutters for the line).
 */
const gutterLineClass = dist_state/* Facet.define */.r$.define();
const defaults = {
    class: "",
    renderEmptyElements: false,
    elementStyle: "",
    markers: () => dist_state/* RangeSet.empty */.Xs.empty,
    lineMarker: () => null,
    lineMarkerChange: null,
    initialSpacer: null,
    updateSpacer: null,
    domEventHandlers: {}
};
const activeGutters = dist_state/* Facet.define */.r$.define();
/** Define an editor gutter. The order in which the gutters appear is determined by their extension priority. */
function gutter(config) {
    return [gutters(), activeGutters.of(Object.assign(Object.assign({}, defaults), config))];
}
const unfixGutters = dist_state/* Facet.define */.r$.define({
    combine: values => values.some(x => x)
});
/**
 * The gutter-drawing plugin is automatically enabled when you add a gutter, but you can use
 * this function to explicitly configure it.
 *
 * Unless `fixed` is explicitly set to `false`, the gutters are fixed, meaning they don't scroll
 * along with the content horizontally (except on Internet Explorer, which doesn't support
 * CSS [`position: sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)).
 */
function gutters(config) {
    let result = [gutterView,];
    if (config && config.fixed === false)
        result.push(unfixGutters.of(true));
    return result;
}
const gutterView = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.view = view;
        this.prevViewport = view.viewport;
        this.dom = document.createElement("div");
        this.dom.className = "cm-gutters";
        this.dom.setAttribute("aria-hidden", "true");
        this.dom.style.minHeight = this.view.contentHeight + "px";
        this.gutters = view.state.facet(activeGutters).map(conf => new SingleGutterView(view, conf));
        for (let gutter of this.gutters)
            this.dom.appendChild(gutter.dom);
        this.fixed = !view.state.facet(unfixGutters);
        if (this.fixed) {
            // FIXME IE11 fallback, which doesn't support position: sticky,
            // by using position: relative + event handlers that realign the
            // gutter (or just force fixed=false on IE11?)
            this.dom.style.position = "sticky";
        }
        this.syncGutters(false);
        view.scrollDOM.insertBefore(this.dom, view.contentDOM);
    }
    update(update) {
        if (this.updateGutters(update)) {
            // Detach during sync when the viewport changed significantly (such as during scrolling), since for large updates that is faster.
            let vpA = this.prevViewport, vpB = update.view.viewport;
            let vpOverlap = Math.min(vpA.to, vpB.to) - Math.max(vpA.from, vpB.from);
            this.syncGutters(vpOverlap < (vpB.to - vpB.from) * 0.8);
        }
        if (update.geometryChanged)
            this.dom.style.minHeight = this.view.contentHeight + "px";
        if (this.view.state.facet(unfixGutters) != !this.fixed) {
            this.fixed = !this.fixed;
            this.dom.style.position = this.fixed ? "sticky" : "";
        }
        this.prevViewport = update.view.viewport;
    }
    syncGutters(detach) {
        let after = this.dom.nextSibling;
        if (detach)
            this.dom.remove();
        let lineClasses = dist_state/* RangeSet.iter */.Xs.iter(this.view.state.facet(gutterLineClass), this.view.viewport.from);
        let classSet = [];
        let contexts = this.gutters.map(gutter => new UpdateContext(gutter, this.view.viewport, -this.view.documentPadding.top));
        for (let line of this.view.viewportLineBlocks) {
            let text;
            if (Array.isArray(line.type)) {
                for (let b of line.type)
                    if (b.type == decoration/* BlockType.Text */.kH.Text) {
                        text = b;
                        break;
                    }
            }
            else {
                text = line.type == decoration/* BlockType.Text */.kH.Text ? line : undefined;
            }
            if (!text)
                continue;
            if (classSet.length)
                classSet = [];
            advanceCursor(lineClasses, classSet, line.from);
            for (let cx of contexts)
                cx.line(this.view, text, classSet);
        }
        for (let cx of contexts)
            cx.finish();
        if (detach)
            this.view.scrollDOM.insertBefore(this.dom, after);
    }
    updateGutters(update) {
        let prev = update.startState.facet(activeGutters), cur = update.state.facet(activeGutters);
        let change = update.docChanged || update.heightChanged || update.viewportChanged ||
            !dist_state/* RangeSet.eq */.Xs.eq(update.startState.facet(gutterLineClass), update.state.facet(gutterLineClass), update.view.viewport.from, update.view.viewport.to);
        if (prev == cur) {
            for (let gutter of this.gutters)
                if (gutter.update(update))
                    change = true;
        }
        else {
            change = true;
            let gutters = [];
            for (let conf of cur) {
                let known = prev.indexOf(conf);
                if (known < 0) {
                    gutters.push(new SingleGutterView(this.view, conf));
                }
                else {
                    this.gutters[known].update(update);
                    gutters.push(this.gutters[known]);
                }
            }
            for (let g of this.gutters) {
                g.dom.remove();
                if (gutters.indexOf(g) < 0)
                    g.destroy();
            }
            for (let g of gutters)
                this.dom.appendChild(g.dom);
            this.gutters = gutters;
        }
        return change;
    }
    destroy() {
        for (let view of this.gutters)
            view.destroy();
        this.dom.remove();
    }
}, {
    provide: plugin => editorview/* EditorView.scrollMargins.of */.t.scrollMargins.of(view => {
        let value = view.plugin(plugin);
        if (!value || value.gutters.length == 0 || !value.fixed)
            return null;
        return view.textDirection == view_bidi/* Direction.LTR */.Nm.LTR ? { left: value.dom.offsetWidth } : { right: value.dom.offsetWidth };
    })
});
function asArray(val) { return (Array.isArray(val) ? val : [val]); }
function advanceCursor(cursor, collect, pos) {
    while (cursor.value && cursor.from <= pos) {
        if (cursor.from == pos)
            collect.push(cursor.value);
        cursor.next();
    }
}
class UpdateContext {
    constructor(gutter, viewport, height) {
        this.gutter = gutter;
        this.height = height;
        this.localMarkers = [];
        this.i = 0;
        this.cursor = dist_state/* RangeSet.iter */.Xs.iter(gutter.markers, viewport.from);
    }
    line(view, line, extraMarkers) {
        if (this.localMarkers.length)
            this.localMarkers = [];
        advanceCursor(this.cursor, this.localMarkers, line.from);
        let localMarkers = extraMarkers.length ? this.localMarkers.concat(extraMarkers) : this.localMarkers;
        let forLine = this.gutter.config.lineMarker(view, line, localMarkers);
        if (forLine)
            localMarkers.unshift(forLine);
        let gutter = this.gutter;
        if (localMarkers.length == 0 && !gutter.config.renderEmptyElements)
            return;
        let above = line.top - this.height;
        if (this.i == gutter.elements.length) {
            let newElt = new GutterElement(view, line.height, above, localMarkers);
            gutter.elements.push(newElt);
            gutter.dom.appendChild(newElt.dom);
        }
        else {
            gutter.elements[this.i].update(view, line.height, above, localMarkers);
        }
        this.height = line.bottom;
        this.i++;
    }
    finish() {
        let gutter = this.gutter;
        while (gutter.elements.length > this.i) {
            let last = gutter.elements.pop();
            gutter.dom.removeChild(last.dom);
            last.destroy();
        }
    }
}
class SingleGutterView {
    constructor(view, config) {
        this.view = view;
        this.config = config;
        this.elements = [];
        this.spacer = null;
        this.dom = document.createElement("div");
        this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
        for (let prop in config.domEventHandlers) {
            this.dom.addEventListener(prop, (event) => {
                let line = view.lineBlockAtHeight(event.clientY - view.documentTop);
                if (config.domEventHandlers[prop](view, line, event))
                    event.preventDefault();
            });
        }
        this.markers = asArray(config.markers(view));
        if (config.initialSpacer) {
            this.spacer = new GutterElement(view, 0, 0, [config.initialSpacer(view)]);
            this.dom.appendChild(this.spacer.dom);
            this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
        }
    }
    update(update) {
        let prevMarkers = this.markers;
        this.markers = asArray(this.config.markers(update.view));
        if (this.spacer && this.config.updateSpacer) {
            let updated = this.config.updateSpacer(this.spacer.markers[0], update);
            if (updated != this.spacer.markers[0])
                this.spacer.update(update.view, 0, 0, [updated]);
        }
        let vp = update.view.viewport;
        return !dist_state/* RangeSet.eq */.Xs.eq(this.markers, prevMarkers, vp.from, vp.to) ||
            (this.config.lineMarkerChange ? this.config.lineMarkerChange(update) : false);
    }
    destroy() {
        for (let elt of this.elements)
            elt.destroy();
    }
}
class GutterElement {
    constructor(view, height, above, markers) {
        this.height = -1;
        this.above = 0;
        this.markers = [];
        this.dom = document.createElement("div");
        this.update(view, height, above, markers);
    }
    update(view, height, above, markers) {
        if (this.height != height)
            this.dom.style.height = (this.height = height) + "px";
        if (this.above != above)
            this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
        if (!sameMarkers(this.markers, markers))
            this.setMarkers(view, markers);
    }
    setMarkers(view, markers) {
        let cls = "cm-gutterElement", domPos = this.dom.firstChild;
        for (let iNew = 0, iOld = 0;;) {
            let skipTo = iOld, marker = iNew < markers.length ? markers[iNew++] : null, matched = false;
            if (marker) {
                let c = marker.elementClass;
                if (c)
                    cls += " " + c;
                for (let i = iOld; i < this.markers.length; i++)
                    if (this.markers[i].compare(marker)) {
                        skipTo = i;
                        matched = true;
                        break;
                    }
            }
            else {
                skipTo = this.markers.length;
            }
            while (iOld < skipTo) {
                let next = this.markers[iOld++];
                if (next.toDOM) {
                    next.destroy(domPos);
                    let after = domPos.nextSibling;
                    domPos.remove();
                    domPos = after;
                }
            }
            if (!marker)
                break;
            if (marker.toDOM) {
                if (matched)
                    domPos = domPos.nextSibling;
                else
                    this.dom.insertBefore(marker.toDOM(view), domPos);
            }
            if (matched)
                iOld++;
        }
        this.dom.className = cls;
        this.markers = markers;
    }
    destroy() {
        this.setMarkers(null, []); // First argument not used unless creating markers
    }
}
function sameMarkers(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!a[i].compare(b[i]))
            return false;
    return true;
}
/** Facet used to provide markers to the line number gutter. */
const lineNumberMarkers = dist_state/* Facet.define */.r$.define();
const lineNumberConfig = dist_state/* Facet.define */.r$.define({
    combine(values) {
        return (0,dist_state/* combineConfig */.BO)(values, { formatNumber: String, domEventHandlers: {} }, {
            domEventHandlers(a, b) {
                let result = Object.assign({}, a);
                for (let event in b) {
                    let exists = result[event], add = b[event];
                    result[event] = exists ? (view, line, event) => exists(view, line, event) || add(view, line, event) : add;
                }
                return result;
            }
        });
    }
});
class NumberMarker extends GutterMarker {
    constructor(number) {
        super();
        this.number = number;
    }
    eq(other) { return this.number == other.number; }
    toDOM() { return document.createTextNode(this.number); }
}
function formatNumber(view, number) {
    return view.state.facet(lineNumberConfig).formatNumber(number, view.state);
}
const lineNumberGutter = activeGutters.compute([lineNumberConfig], state => ({
    class: "cm-lineNumbers",
    renderEmptyElements: false,
    markers(view) { return view.state.facet(lineNumberMarkers); },
    lineMarker(view, line, others) {
        if (others.some(m => m.toDOM))
            return null;
        return new NumberMarker(formatNumber(view, view.state.doc.lineAt(line.from).number));
    },
    lineMarkerChange: update => update.startState.facet(lineNumberConfig) != update.state.facet(lineNumberConfig),
    initialSpacer(view) {
        return new NumberMarker(formatNumber(view, maxLineNumber(view.state.doc.lines)));
    },
    updateSpacer(spacer, update) {
        let max = formatNumber(update.view, maxLineNumber(update.view.state.doc.lines));
        return max == spacer.number ? spacer : new NumberMarker(max);
    },
    domEventHandlers: state.facet(lineNumberConfig).domEventHandlers
}));
/** Create a line number gutter extension. */
function lineNumbers(config = {}) {
    return [
        lineNumberConfig.of(config),
        gutters(),
        lineNumberGutter
    ];
}
function maxLineNumber(lines) {
    let last = 9;
    while (last < lines)
        last = last * 10 + 9;
    return last;
}
const activeLineGutterMarker = new class extends GutterMarker {
    constructor() {
        super(...arguments);
        this.elementClass = "cm-activeLineGutter";
    }
};
const activeLineGutterHighlighter = gutterLineClass.compute(["selection"], state => {
    let marks = [], last = -1;
    for (let range of state.selection.ranges)
        if (range.empty) {
            let linePos = state.doc.lineAt(range.head).from;
            if (linePos > last) {
                last = linePos;
                marks.push(activeLineGutterMarker.range(linePos));
            }
        }
    return dist_state/* RangeSet.of */.Xs.of(marks);
});
/**
 * Returns an extension that adds a `cm-activeLineGutter` class to all gutter elements on the [active
 * line]{@link highlightActiveLine}.
 */
function highlightActiveLineGutter() {
    return activeLineGutterHighlighter;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/index.js




















// @internal
const __test = { HeightMap: heightmap/* HeightMap */.uG, HeightOracle: heightmap/* HeightOracle */.eU, MeasuredHeights: heightmap/* MeasuredHeights */.y_, QueryType: heightmap/* QueryType */.xL, ChangedRange: extension/* ChangedRange */.Uh, computeOrder: view_bidi/* computeOrder */.nG, moveVisually: view_bidi/* moveVisually */.z_ };

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/common/tree.js
const DefaultBufferLength = 1024;
let nextPropID = 0;
class tree_Range {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
class tree_NodeProp {
    constructor(config = {}) {
        this.id = nextPropID++;
        this.perNode = !!config.perNode;
        this.deserialize = config.deserialize || (() => {
            throw new Error("This node type doesn't define a deserialize function");
        });
    }
    add(match) {
        if (this.perNode)
            throw new RangeError("Can't add per-node props to node types");
        if (typeof match != "function")
            match = tree_NodeType.match(match);
        return (type) => {
            let result = match(type);
            return result === undefined ? null : [this, result];
        };
    }
}
tree_NodeProp.closedBy = new tree_NodeProp({ deserialize: str => str.split(" ") });
tree_NodeProp.openedBy = new tree_NodeProp({ deserialize: str => str.split(" ") });
tree_NodeProp.group = new tree_NodeProp({ deserialize: str => str.split(" ") });
tree_NodeProp.contextHash = new tree_NodeProp({ perNode: true });
tree_NodeProp.lookAhead = new tree_NodeProp({ perNode: true });
tree_NodeProp.mounted = new tree_NodeProp({ perNode: true });
class tree_MountedTree {
    constructor(tree, overlay, parser) {
        this.tree = tree;
        this.overlay = overlay;
        this.parser = parser;
    }
}
const noProps = Object.create(null);
class tree_NodeType {
    // @internal
    constructor(name, 
    // @internal
    props, id, 
    // @internal
    flags = 0) {
        this.name = name;
        this.props = props;
        this.id = id;
        this.flags = flags;
    }
    static define(spec) {
        let props = spec.props && spec.props.length ? Object.create(null) : noProps;
        let flags = (spec.top ? 1 /* Top */ : 0) | (spec.skipped ? 2 /* Skipped */ : 0) |
            (spec.error ? 4 /* Error */ : 0) | (spec.name == null ? 8 /* Anonymous */ : 0);
        let type = new tree_NodeType(spec.name || "", props, spec.id, flags);
        if (spec.props)
            for (let src of spec.props) {
                if (!Array.isArray(src))
                    src = src(type);
                if (src) {
                    if (src[0].perNode)
                        throw new RangeError("Can't store a per-node prop on a node type");
                    props[src[0].id] = src[1];
                }
            }
        return type;
    }
    prop(prop) { return this.props[prop.id]; }
    get isTop() { return (this.flags & 1 /* Top */) > 0; }
    get isSkipped() { return (this.flags & 2 /* Skipped */) > 0; }
    get isError() { return (this.flags & 4 /* Error */) > 0; }
    get isAnonymous() { return (this.flags & 8 /* Anonymous */) > 0; }
    is(name) {
        if (typeof name == 'string') {
            if (this.name == name)
                return true;
            let group = this.prop(tree_NodeProp.group);
            return group ? group.indexOf(name) > -1 : false;
        }
        return this.id == name;
    }
    static match(map) {
        let direct = Object.create(null);
        for (let prop in map)
            for (let name of prop.split(" "))
                direct[name] = map[prop];
        return (node) => {
            for (let groups = node.prop(tree_NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
                let found = direct[i < 0 ? node.name : groups[i]];
                if (found)
                    return found;
            }
        };
    }
}
tree_NodeType.none = new tree_NodeType("", Object.create(null), 0, 8 /* Anonymous */);
class NodeSet {
    constructor(types) {
        this.types = types;
        for (let i = 0; i < types.length; i++)
            if (types[i].id != i)
                throw new RangeError("Node type ids should correspond to array positions when creating a node set");
    }
    extend(...props) {
        let newTypes = [];
        for (let type of this.types) {
            let newProps = null;
            for (let source of props) {
                let add = source(type);
                if (add) {
                    if (!newProps)
                        newProps = Object.assign({}, type.props);
                    newProps[add[0].id] = add[1];
                }
            }
            newTypes.push(newProps ? new tree_NodeType(type.name, newProps, type.id, type.flags) : type);
        }
        return new NodeSet(newTypes);
    }
}
const CachedNode = new WeakMap(), CachedInnerNode = new WeakMap();
var tree_IterMode;
(function (IterMode) {
    IterMode[IterMode["ExcludeBuffers"] = 1] = "ExcludeBuffers";
    IterMode[IterMode["IncludeAnonymous"] = 2] = "IncludeAnonymous";
    IterMode[IterMode["IgnoreMounts"] = 4] = "IgnoreMounts";
    IterMode[IterMode["IgnoreOverlays"] = 8] = "IgnoreOverlays";
})(tree_IterMode || (tree_IterMode = {}));
class tree_Tree {
    constructor(type, children, positions, length, props) {
        this.type = type;
        this.children = children;
        this.positions = positions;
        this.length = length;
        // @internal
        this.props = null;
        if (props && props.length) {
            this.props = Object.create(null);
            for (let [prop, value] of props)
                this.props[typeof prop == "number" ? prop : prop.id] = value;
        }
    }
    // @internal
    toString() {
        let mounted = this.prop(tree_NodeProp.mounted);
        if (mounted && !mounted.overlay)
            return mounted.tree.toString();
        let children = "";
        for (let ch of this.children) {
            let str = ch.toString();
            if (str) {
                if (children)
                    children += ",";
                children += str;
            }
        }
        return !this.type.name ? children :
            (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) +
                (children.length ? "(" + children + ")" : "");
    }
    cursor(mode = 0) {
        return new tree_TreeCursor(this.topNode, mode);
    }
    cursorAt(pos, side = 0, mode = 0) {
        let scope = CachedNode.get(this) || this.topNode;
        let cursor = new tree_TreeCursor(scope);
        cursor.moveTo(pos, side);
        CachedNode.set(this, cursor._tree);
        return cursor;
    }
    get topNode() {
        return new tree_TreeNode(this, 0, 0, null);
    }
    resolve(pos, side = 0) {
        let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
        CachedNode.set(this, node);
        return node;
    }
    resolveInner(pos, side = 0) {
        let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
        CachedInnerNode.set(this, node);
        return node;
    }
    iterate(spec) {
        let { enter, leave, from = 0, to = this.length } = spec;
        for (let c = this.cursor((spec.mode || 0) | tree_IterMode.IncludeAnonymous);;) {
            let entered = false;
            if (c.from <= to && c.to >= from && (c.type.isAnonymous || enter(c) !== false)) {
                if (c.firstChild())
                    continue;
                entered = true;
            }
            for (;;) {
                if (entered && leave && !c.type.isAnonymous)
                    leave(c);
                if (c.nextSibling())
                    break;
                if (!c.parent())
                    return;
                entered = true;
            }
        }
    }
    prop(prop) {
        return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : undefined;
    }
    get propValues() {
        let result = [];
        if (this.props)
            for (let id in this.props)
                result.push([+id, this.props[id]]);
        return result;
    }
    balance(config = {}) {
        return this.children.length <= 8 /* BranchFactor */ ? this :
            balanceRange(tree_NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new tree_Tree(this.type, children, positions, length, this.propValues), config.makeTree || ((children, positions, length) => new tree_Tree(tree_NodeType.none, children, positions, length)));
    }
    static build(data) { return buildTree(data); }
}
tree_Tree.empty = new tree_Tree(tree_NodeType.none, [], [], 0);
class FlatBufferCursor {
    constructor(buffer, index) {
        this.buffer = buffer;
        this.index = index;
    }
    get id() { return this.buffer[this.index - 4]; }
    get start() { return this.buffer[this.index - 3]; }
    get end() { return this.buffer[this.index - 2]; }
    get size() { return this.buffer[this.index - 1]; }
    get pos() { return this.index; }
    next() { this.index -= 4; }
    fork() { return new FlatBufferCursor(this.buffer, this.index); }
}
class TreeBuffer {
    constructor(buffer, length, set) {
        this.buffer = buffer;
        this.length = length;
        this.set = set;
    }
    // @internal
    get type() { return tree_NodeType.none; }
    // @internal
    toString() {
        let result = [];
        for (let index = 0; index < this.buffer.length;) {
            result.push(this.childString(index));
            index = this.buffer[index + 3];
        }
        return result.join(",");
    }
    // @internal
    childString(index) {
        let id = this.buffer[index], endIndex = this.buffer[index + 3];
        let type = this.set.types[id], result = type.name;
        if (/\W/.test(result) && !type.isError)
            result = JSON.stringify(result);
        index += 4;
        if (endIndex == index)
            return result;
        let children = [];
        while (index < endIndex) {
            children.push(this.childString(index));
            index = this.buffer[index + 3];
        }
        return result + "(" + children.join(",") + ")";
    }
    // @internal
    findChild(startIndex, endIndex, dir, pos, side) {
        let { buffer } = this, pick = -1;
        for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
            if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
                pick = i;
                if (dir > 0)
                    break;
            }
        }
        return pick;
    }
    // @internal
    slice(startI, endI, from, to) {
        let b = this.buffer;
        let copy = new Uint16Array(endI - startI);
        for (let i = startI, j = 0; i < endI;) {
            copy[j++] = b[i++];
            copy[j++] = b[i++] - from;
            copy[j++] = b[i++] - from;
            copy[j++] = b[i++] - startI;
        }
        return new TreeBuffer(copy, to - from, this.set);
    }
}
function checkSide(side, pos, from, to) {
    switch (side) {
        case -2 /* Before */: return from < pos;
        case -1 /* AtOrBefore */: return to >= pos && from < pos;
        case 0 /* Around */: return from < pos && to > pos;
        case 1 /* AtOrAfter */: return from <= pos && to > pos;
        case 2 /* After */: return to > pos;
        case 4 /* DontCare */: return true;
    }
}
function enterUnfinishedNodesBefore(node, pos) {
    let scan = node.childBefore(pos);
    while (scan) {
        let last = scan.lastChild;
        if (!last || last.to != scan.to)
            break;
        if (last.type.isError && last.from == last.to) {
            node = scan;
            scan = last.prevSibling;
        }
        else {
            scan = last;
        }
    }
    return node;
}
function resolveNode(node, pos, side, overlays) {
    var _a;
    // Move up to a node that actually holds the position, if possible
    while (node.from == node.to ||
        (side < 1 ? node.from >= pos : node.from > pos) ||
        (side > -1 ? node.to <= pos : node.to < pos)) {
        let parent = !overlays && node instanceof tree_TreeNode && node.index < 0 ? null : node.parent;
        if (!parent)
            return node;
        node = parent;
    }
    let mode = overlays ? 0 : tree_IterMode.IgnoreOverlays;
    // Must go up out of overlays when those do not overlap with pos
    if (overlays)
        for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
            if (scan instanceof tree_TreeNode && scan.index < 0 && ((_a = parent.enter(pos, side, mode)) === null || _a === void 0 ? void 0 : _a.from) != scan.from)
                node = parent;
        }
    for (;;) {
        let inner = node.enter(pos, side, mode);
        if (!inner)
            return node;
        node = inner;
    }
}
class tree_TreeNode {
    constructor(_tree, from, 
    // Index in parent node, set to -1 if the node is not a direct child of _parent.node (overlay)
    index, _parent) {
        this._tree = _tree;
        this.from = from;
        this.index = index;
        this._parent = _parent;
    }
    get type() { return this._tree.type; }
    get name() { return this._tree.type.name; }
    get to() { return this.from + this._tree.length; }
    nextChild(i, dir, pos, side, mode = 0) {
        for (let parent = this;;) {
            for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i != e; i += dir) {
                let next = children[i], start = positions[i] + parent.from;
                if (!checkSide(side, pos, start, start + next.length))
                    continue;
                if (next instanceof TreeBuffer) {
                    if (mode & tree_IterMode.ExcludeBuffers)
                        continue;
                    let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
                    if (index > -1)
                        return new BufferNode(new BufferContext(parent, next, i, start), null, index);
                }
                else if ((mode & tree_IterMode.IncludeAnonymous) || (!next.type.isAnonymous || hasChild(next))) {
                    let mounted;
                    if (!(mode & tree_IterMode.IgnoreMounts) &&
                        next.props && (mounted = next.prop(tree_NodeProp.mounted)) && !mounted.overlay)
                        return new tree_TreeNode(mounted.tree, start, i, parent);
                    let inner = new tree_TreeNode(next, start, i, parent);
                    return (mode & tree_IterMode.IncludeAnonymous) || !inner.type.isAnonymous ? inner
                        : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side);
                }
            }
            if ((mode & tree_IterMode.IncludeAnonymous) || !parent.type.isAnonymous)
                return null;
            if (parent.index >= 0)
                i = parent.index + dir;
            else
                i = dir < 0 ? -1 : parent._parent._tree.children.length;
            parent = parent._parent;
            if (!parent)
                return null;
        }
    }
    get firstChild() { return this.nextChild(0, 1, 0, 4 /* DontCare */); }
    get lastChild() { return this.nextChild(this._tree.children.length - 1, -1, 0, 4 /* DontCare */); }
    childAfter(pos) { return this.nextChild(0, 1, pos, 2 /* After */); }
    childBefore(pos) { return this.nextChild(this._tree.children.length - 1, -1, pos, -2 /* Before */); }
    enter(pos, side, mode = 0) {
        let mounted;
        if (!(mode & tree_IterMode.IgnoreOverlays) && (mounted = this._tree.prop(tree_NodeProp.mounted)) && mounted.overlay) {
            let rPos = pos - this.from;
            for (let { from, to } of mounted.overlay) {
                if ((side > 0 ? from <= rPos : from < rPos) &&
                    (side < 0 ? to >= rPos : to > rPos))
                    return new tree_TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
            }
        }
        return this.nextChild(0, 1, pos, side, mode);
    }
    nextSignificantParent() {
        let val = this;
        while (val.type.isAnonymous && val._parent)
            val = val._parent;
        return val;
    }
    get parent() {
        return this._parent ? this._parent.nextSignificantParent() : null;
    }
    get nextSibling() {
        return this._parent && this.index >= 0 ? this._parent.nextChild(this.index + 1, 1, 0, 4 /* DontCare */) : null;
    }
    get prevSibling() {
        return this._parent && this.index >= 0 ? this._parent.nextChild(this.index - 1, -1, 0, 4 /* DontCare */) : null;
    }
    cursor(mode = 0) { return new tree_TreeCursor(this, mode); }
    get tree() { return this._tree; }
    toTree() { return this._tree; }
    resolve(pos, side = 0) {
        return resolveNode(this, pos, side, false);
    }
    resolveInner(pos, side = 0) {
        return resolveNode(this, pos, side, true);
    }
    enterUnfinishedNodesBefore(pos) { return enterUnfinishedNodesBefore(this, pos); }
    getChild(type, before = null, after = null) {
        let r = getChildren(this, type, before, after);
        return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
        return getChildren(this, type, before, after);
    }
    // @internal
    toString() { return this._tree.toString(); }
    get node() { return this; }
    matchContext(context) { return matchNodeContext(this, context); }
}
function getChildren(node, type, before, after) {
    let cur = node.cursor(), result = [];
    if (!cur.firstChild())
        return result;
    if (before != null)
        while (!cur.type.is(before))
            if (!cur.nextSibling())
                return result;
    for (;;) {
        if (after != null && cur.type.is(after))
            return result;
        if (cur.type.is(type))
            result.push(cur.node);
        if (!cur.nextSibling())
            return after == null ? result : [];
    }
}
function matchNodeContext(node, context, i = context.length - 1) {
    for (let p = node.parent; i >= 0; p = p.parent) {
        if (!p)
            return false;
        if (!p.type.isAnonymous) {
            if (context[i] && context[i] != p.name)
                return false;
            i--;
        }
    }
    return true;
}
class BufferContext {
    constructor(parent, buffer, index, start) {
        this.parent = parent;
        this.buffer = buffer;
        this.index = index;
        this.start = start;
    }
}
class BufferNode {
    constructor(context, _parent, index) {
        this.context = context;
        this._parent = _parent;
        this.index = index;
        this.type = context.buffer.set.types[context.buffer.buffer[index]];
    }
    get name() { return this.type.name; }
    get from() { return this.context.start + this.context.buffer.buffer[this.index + 1]; }
    get to() { return this.context.start + this.context.buffer.buffer[this.index + 2]; }
    child(dir, pos, side) {
        let { buffer } = this.context;
        let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
        return index < 0 ? null : new BufferNode(this.context, this, index);
    }
    get firstChild() { return this.child(1, 0, 4 /* DontCare */); }
    get lastChild() { return this.child(-1, 0, 4 /* DontCare */); }
    childAfter(pos) { return this.child(1, pos, 2 /* After */); }
    childBefore(pos) { return this.child(-1, pos, -2 /* Before */); }
    enter(pos, side, mode = 0) {
        if (mode & tree_IterMode.ExcludeBuffers)
            return null;
        let { buffer } = this.context;
        let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
        return index < 0 ? null : new BufferNode(this.context, this, index);
    }
    get parent() {
        return this._parent || this.context.parent.nextSignificantParent();
    }
    externalSibling(dir) {
        return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, 0, 4 /* DontCare */);
    }
    get nextSibling() {
        let { buffer } = this.context;
        let after = buffer.buffer[this.index + 3];
        if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
            return new BufferNode(this.context, this._parent, after);
        return this.externalSibling(1);
    }
    get prevSibling() {
        let { buffer } = this.context;
        let parentStart = this._parent ? this._parent.index + 4 : 0;
        if (this.index == parentStart)
            return this.externalSibling(-1);
        return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, 0, 4 /* DontCare */));
    }
    cursor(mode = 0) { return new tree_TreeCursor(this, mode); }
    get tree() { return null; }
    toTree() {
        let children = [], positions = [];
        let { buffer } = this.context;
        let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
        if (endI > startI) {
            let from = buffer.buffer[this.index + 1], to = buffer.buffer[this.index + 2];
            children.push(buffer.slice(startI, endI, from, to));
            positions.push(0);
        }
        return new tree_Tree(this.type, children, positions, this.to - this.from);
    }
    resolve(pos, side = 0) {
        return resolveNode(this, pos, side, false);
    }
    resolveInner(pos, side = 0) {
        return resolveNode(this, pos, side, true);
    }
    enterUnfinishedNodesBefore(pos) { return enterUnfinishedNodesBefore(this, pos); }
    // @internal
    toString() { return this.context.buffer.childString(this.index); }
    getChild(type, before = null, after = null) {
        let r = getChildren(this, type, before, after);
        return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
        return getChildren(this, type, before, after);
    }
    get node() { return this; }
    matchContext(context) { return matchNodeContext(this, context); }
}
class tree_TreeCursor {
    // @internal
    constructor(node, 
    // @internal
    mode = 0) {
        this.mode = mode;
        // @internal
        this.buffer = null;
        this.stack = [];
        // @internal
        this.index = 0;
        this.bufferNode = null;
        if (node instanceof tree_TreeNode) {
            this.yieldNode(node);
        }
        else {
            this._tree = node.context.parent;
            this.buffer = node.context;
            for (let n = node._parent; n; n = n._parent)
                this.stack.unshift(n.index);
            this.bufferNode = node;
            this.yieldBuf(node.index);
        }
    }
    get name() { return this.type.name; }
    yieldNode(node) {
        if (!node)
            return false;
        this._tree = node;
        this.type = node.type;
        this.from = node.from;
        this.to = node.to;
        return true;
    }
    yieldBuf(index, type) {
        this.index = index;
        let { start, buffer } = this.buffer;
        this.type = type || buffer.set.types[buffer.buffer[index]];
        this.from = start + buffer.buffer[index + 1];
        this.to = start + buffer.buffer[index + 2];
        return true;
    }
    yield(node) {
        if (!node)
            return false;
        if (node instanceof tree_TreeNode) {
            this.buffer = null;
            return this.yieldNode(node);
        }
        this.buffer = node.context;
        return this.yieldBuf(node.index, node.type);
    }
    // @internal
    toString() {
        return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
    }
    // @internal
    enterChild(dir, pos, side) {
        if (!this.buffer)
            return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
        let { buffer } = this.buffer;
        let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
        if (index < 0)
            return false;
        this.stack.push(this.index);
        return this.yieldBuf(index);
    }
    firstChild() { return this.enterChild(1, 0, 4 /* DontCare */); }
    lastChild() { return this.enterChild(-1, 0, 4 /* DontCare */); }
    childAfter(pos) { return this.enterChild(1, pos, 2 /* After */); }
    childBefore(pos) { return this.enterChild(-1, pos, -2 /* Before */); }
    enter(pos, side, mode = this.mode) {
        if (!this.buffer)
            return this.yield(this._tree.enter(pos, side, mode));
        return mode & tree_IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
    }
    parent() {
        if (!this.buffer)
            return this.yieldNode((this.mode & tree_IterMode.IncludeAnonymous) ? this._tree._parent : this._tree.parent);
        if (this.stack.length)
            return this.yieldBuf(this.stack.pop());
        let parent = (this.mode & tree_IterMode.IncludeAnonymous) ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
        this.buffer = null;
        return this.yieldNode(parent);
    }
    // @internal
    sibling(dir) {
        if (!this.buffer)
            return !this._tree._parent ? false
                : this.yield(this._tree.index < 0 ? null
                    : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4 /* DontCare */, this.mode));
        let { buffer } = this.buffer, d = this.stack.length - 1;
        if (dir < 0) {
            let parentStart = d < 0 ? 0 : this.stack[d] + 4;
            if (this.index != parentStart)
                return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, 0, 4 /* DontCare */));
        }
        else {
            let after = buffer.buffer[this.index + 3];
            if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
                return this.yieldBuf(after);
        }
        return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4 /* DontCare */, this.mode)) : false;
    }
    nextSibling() { return this.sibling(1); }
    prevSibling() { return this.sibling(-1); }
    atLastNode(dir) {
        let index, parent, { buffer } = this;
        if (buffer) {
            if (dir > 0) {
                if (this.index < buffer.buffer.buffer.length)
                    return false;
            }
            else {
                for (let i = 0; i < this.index; i++)
                    if (buffer.buffer.buffer[i + 3] < this.index)
                        return false;
            }
            ;
            ({ index, parent } = buffer);
        }
        else {
            ({ index, _parent: parent } = this._tree);
        }
        for (; parent; { index, _parent: parent } = parent) {
            if (index > -1)
                for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
                    let child = parent._tree.children[i];
                    if ((this.mode & tree_IterMode.IncludeAnonymous) ||
                        child instanceof TreeBuffer ||
                        !child.type.isAnonymous ||
                        hasChild(child))
                        return false;
                }
        }
        return true;
    }
    move(dir, enter) {
        if (enter && this.enterChild(dir, 0, 4 /* DontCare */))
            return true;
        for (;;) {
            if (this.sibling(dir))
                return true;
            if (this.atLastNode(dir) || !this.parent())
                return false;
        }
    }
    next(enter = true) { return this.move(1, enter); }
    prev(enter = true) { return this.move(-1, enter); }
    moveTo(pos, side = 0) {
        // Move up to a node that actually holds the position, if possible
        while (this.from == this.to ||
            (side < 1 ? this.from >= pos : this.from > pos) ||
            (side > -1 ? this.to <= pos : this.to < pos))
            if (!this.parent())
                break;
        // Then scan down into child nodes as far as possible
        while (this.enterChild(1, pos, side)) { }
        return this;
    }
    get node() {
        if (!this.buffer)
            return this._tree;
        let cache = this.bufferNode, result = null, depth = 0;
        if (cache && cache.context == this.buffer) {
            scan: for (let index = this.index, d = this.stack.length; d >= 0;) {
                for (let c = cache; c; c = c._parent)
                    if (c.index == index) {
                        if (index == this.index)
                            return c;
                        result = c;
                        depth = d + 1;
                        break scan;
                    }
                index = this.stack[--d];
            }
        }
        for (let i = depth; i < this.stack.length; i++)
            result = new BufferNode(this.buffer, result, this.stack[i]);
        return this.bufferNode = new BufferNode(this.buffer, result, this.index);
    }
    get tree() {
        return this.buffer ? null : this._tree._tree;
    }
    iterate(enter, leave) {
        for (let depth = 0;;) {
            let mustLeave = false;
            if (this.type.isAnonymous || enter(this) !== false) {
                if (this.firstChild()) {
                    depth++;
                    continue;
                }
                if (!this.type.isAnonymous)
                    mustLeave = true;
            }
            for (;;) {
                if (mustLeave && leave)
                    leave(this);
                mustLeave = this.type.isAnonymous;
                if (this.nextSibling())
                    break;
                if (!depth)
                    return;
                this.parent();
                depth--;
                mustLeave = true;
            }
        }
    }
    matchContext(context) {
        if (!this.buffer)
            return matchNodeContext(this.node, context);
        let { buffer } = this.buffer, { types } = buffer.set;
        for (let i = context.length - 1, d = this.stack.length - 1; i >= 0; d--) {
            if (d < 0)
                return matchNodeContext(this.node, context, i);
            let type = types[buffer.buffer[this.stack[d]]];
            if (!type.isAnonymous) {
                if (context[i] && context[i] != type.name)
                    return false;
                i--;
            }
        }
        return true;
    }
}
function hasChild(tree) {
    return tree.children.some(ch => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
}
function buildTree(data) {
    var _a;
    let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
    let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
    let types = nodeSet.types;
    let contextHash = 0, lookAhead = 0;
    function takeNode(parentStart, minPos, children, positions, inRepeat) {
        let { id, start, end, size } = cursor;
        let lookAheadAtStart = lookAhead;
        while (size < 0) {
            cursor.next();
            if (size == -1 /* Reuse */) {
                let node = reused[id];
                children.push(node);
                positions.push(start - parentStart);
                return;
            }
            else if (size == -3 /* ContextChange */) { // Context change
                contextHash = id;
                return;
            }
            else if (size == -4 /* LookAhead */) {
                lookAhead = id;
                return;
            }
            else {
                throw new RangeError(`Unrecognized record size: ${size}`);
            }
            ;
            ({ id, start, end, size } = cursor);
        }
        let type = types[id], node, buffer;
        let startPos = start - parentStart;
        if (end - start <= maxBufferLength && (buffer = findBufferSize(cursor.pos - minPos, inRepeat))) {
            // Small enough for a buffer, and no reused nodes inside
            let data = new Uint16Array(buffer.size - buffer.skip);
            let endPos = cursor.pos - buffer.size, index = data.length;
            while (cursor.pos > endPos)
                index = copyToBuffer(buffer.start, data, index);
            node = new TreeBuffer(data, end - buffer.start, nodeSet);
            startPos = buffer.start - parentStart;
        }
        else { // Make it a node
            let endPos = cursor.pos - size;
            cursor.next();
            let localChildren = [], localPositions = [];
            let localInRepeat = id >= minRepeatType ? id : -1;
            let lastGroup = 0, lastEnd = end;
            while (cursor.pos > endPos) {
                if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
                    if (cursor.end <= lastEnd - maxBufferLength) {
                        makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart);
                        lastGroup = localChildren.length;
                        lastEnd = cursor.end;
                    }
                    cursor.next();
                }
                else {
                    takeNode(start, endPos, localChildren, localPositions, localInRepeat);
                }
            }
            if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
                makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart);
            localChildren.reverse();
            localPositions.reverse();
            if (localInRepeat > -1 && lastGroup > 0) {
                let make = makeBalanced(type);
                node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
            }
            else {
                node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end);
            }
        }
        children.push(node);
        positions.push(startPos);
    }
    function makeBalanced(type) {
        return (children, positions, length) => {
            let lookAhead = 0, lastI = children.length - 1, last, lookAheadProp;
            if (lastI >= 0 && (last = children[lastI]) instanceof tree_Tree) {
                if (!lastI && last.type == type && last.length == length)
                    return last;
                if (lookAheadProp = last.prop(tree_NodeProp.lookAhead))
                    lookAhead = positions[lastI] + last.length + lookAheadProp;
            }
            return makeTree(type, children, positions, length, lookAhead);
        };
    }
    function makeRepeatLeaf(children, positions, base, i, from, to, type, lookAhead) {
        let localChildren = [], localPositions = [];
        while (children.length > i) {
            localChildren.push(children.pop());
            localPositions.push(positions.pop() + base - from);
        }
        children.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead - to));
        positions.push(from - base);
    }
    function makeTree(type, children, positions, length, lookAhead = 0, props) {
        if (contextHash) {
            let pair = [tree_NodeProp.contextHash, contextHash];
            props = props ? [pair].concat(props) : [pair];
        }
        if (lookAhead > 25) {
            let pair = [tree_NodeProp.lookAhead, lookAhead];
            props = props ? [pair].concat(props) : [pair];
        }
        return new tree_Tree(type, children, positions, length, props);
    }
    function findBufferSize(maxSize, inRepeat) {
        // Scan through the buffer to find previous siblings that fit
        // together in a TreeBuffer, and don't contain any reused nodes
        // (which can't be stored in a buffer).
        // If `inRepeat` is > -1, ignore node boundaries of that type for
        // nesting, but make sure the end falls either at the start
        // (`maxSize`) or before such a node.
        let fork = cursor.fork();
        let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
        let result = { size: 0, start: 0, skip: 0 };
        scan: for (let minPos = fork.pos - maxSize; fork.pos > minPos;) {
            let nodeSize = fork.size;
            // Pretend nested repeat nodes of the same type don't exist
            if (fork.id == inRepeat && nodeSize >= 0) {
                // Except that we store the current state as a valid return
                // value.
                result.size = size;
                result.start = start;
                result.skip = skip;
                skip += 4;
                size += 4;
                fork.next();
                continue;
            }
            let startPos = fork.pos - nodeSize;
            if (nodeSize < 0 || startPos < minPos || fork.start < minStart)
                break;
            let localSkipped = fork.id >= minRepeatType ? 4 : 0;
            let nodeStart = fork.start;
            fork.next();
            while (fork.pos > startPos) {
                if (fork.size < 0) {
                    if (fork.size == -3 /* ContextChange */)
                        localSkipped += 4;
                    else
                        break scan;
                }
                else if (fork.id >= minRepeatType) {
                    localSkipped += 4;
                }
                fork.next();
            }
            start = nodeStart;
            size += nodeSize;
            skip += localSkipped;
        }
        if (inRepeat < 0 || size == maxSize) {
            result.size = size;
            result.start = start;
            result.skip = skip;
        }
        return result.size > 4 ? result : undefined;
    }
    function copyToBuffer(bufferStart, buffer, index) {
        let { id, start, end, size } = cursor;
        cursor.next();
        if (size >= 0 && id < minRepeatType) {
            let startIndex = index;
            if (size > 4) {
                let endPos = cursor.pos - (size - 4);
                while (cursor.pos > endPos)
                    index = copyToBuffer(bufferStart, buffer, index);
            }
            buffer[--index] = startIndex;
            buffer[--index] = end - bufferStart;
            buffer[--index] = start - bufferStart;
            buffer[--index] = id;
        }
        else if (size == -3 /* ContextChange */) {
            contextHash = id;
        }
        else if (size == -4 /* LookAhead */) {
            lookAhead = id;
        }
        return index;
    }
    let children = [], positions = [];
    while (cursor.pos > 0)
        takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1);
    let length = (_a = data.length) !== null && _a !== void 0 ? _a : (children.length ? positions[0] + children[0].length : 0);
    return new tree_Tree(types[data.topID], children.reverse(), positions.reverse(), length);
}
const nodeSizeCache = new WeakMap;
function nodeSize(balanceType, node) {
    if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
        return 1;
    let size = nodeSizeCache.get(node);
    if (size == null) {
        size = 1;
        for (let child of node.children) {
            if (child.type != balanceType || !(child instanceof tree_Tree)) {
                size = 1;
                break;
            }
            size += nodeSize(balanceType, child);
        }
        nodeSizeCache.set(node, size);
    }
    return size;
}
function balanceRange(
// The type the balanced tree's inner nodes.
balanceType, 
// The direct children and their positions
children, positions, 
// The index range in children/positions to use
from, to, 
// The start position of the nodes, relative to their parent.
start, 
// Length of the outer node
length, 
// Function to build the top node of the balanced tree
mkTop, 
// Function to build internal nodes for the balanced tree
mkTree) {
    let total = 0;
    for (let i = from; i < to; i++)
        total += nodeSize(balanceType, children[i]);
    let maxChild = Math.ceil((total * 1.5) / 8 /* BranchFactor */);
    let localChildren = [], localPositions = [];
    function divide(children, positions, from, to, offset) {
        for (let i = from; i < to;) {
            let groupFrom = i, groupStart = positions[i], groupSize = nodeSize(balanceType, children[i]);
            i++;
            for (; i < to; i++) {
                let nextSize = nodeSize(balanceType, children[i]);
                if (groupSize + nextSize >= maxChild)
                    break;
                groupSize += nextSize;
            }
            if (i == groupFrom + 1) {
                if (groupSize > maxChild) {
                    let only = children[groupFrom]; // Only trees can have a size > 1
                    divide(only.children, only.positions, 0, only.children.length, positions[groupFrom] + offset);
                    continue;
                }
                localChildren.push(children[groupFrom]);
            }
            else {
                let length = positions[i - 1] + children[i - 1].length - groupStart;
                localChildren.push(balanceRange(balanceType, children, positions, groupFrom, i, groupStart, length, null, mkTree));
            }
            localPositions.push(groupStart + offset - start);
        }
    }
    divide(children, positions, from, to, 0);
    return (mkTop || mkTree)(localChildren, localPositions, length);
}
class NodeWeakMap {
    constructor() {
        this.map = new WeakMap();
    }
    setBuffer(buffer, index, value) {
        let inner = this.map.get(buffer);
        if (!inner)
            this.map.set(buffer, inner = new Map);
        inner.set(index, value);
    }
    getBuffer(buffer, index) {
        let inner = this.map.get(buffer);
        return inner && inner.get(index);
    }
    set(node, value) {
        if (node instanceof BufferNode)
            this.setBuffer(node.context.buffer, node.index, value);
        else if (node instanceof tree_TreeNode)
            this.map.set(node.tree, value);
    }
    get(node) {
        return node instanceof BufferNode ? this.getBuffer(node.context.buffer, node.index)
            : node instanceof tree_TreeNode ? this.map.get(node.tree) : undefined;
    }
    cursorSet(cursor, value) {
        if (cursor.buffer)
            this.setBuffer(cursor.buffer.buffer, cursor.index, value);
        else
            this.map.set(cursor.tree, value);
    }
    cursorGet(cursor) {
        return cursor.buffer ? this.getBuffer(cursor.buffer.buffer, cursor.index) : this.map.get(cursor.tree);
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/common/parse.js

class parse_TreeFragment {
    constructor(from, to, tree, offset, openStart = false, openEnd = false) {
        this.from = from;
        this.to = to;
        this.tree = tree;
        this.offset = offset;
        this.open = (openStart ? 1 /* Start */ : 0) | (openEnd ? 2 /* End */ : 0);
    }
    get openStart() { return (this.open & 1 /* Start */) > 0; }
    get openEnd() { return (this.open & 2 /* End */) > 0; }
    static addTree(tree, fragments = [], partial = false) {
        let result = [new parse_TreeFragment(0, tree.length, tree, 0, false, partial)];
        for (let f of fragments)
            if (f.to > tree.length)
                result.push(f);
        return result;
    }
    static applyChanges(fragments, changes, minGap = 128) {
        if (!changes.length)
            return fragments;
        let result = [];
        let fI = 1, nextF = fragments.length ? fragments[0] : null;
        for (let cI = 0, pos = 0, off = 0;; cI++) {
            let nextC = cI < changes.length ? changes[cI] : null;
            let nextPos = nextC ? nextC.fromA : 1e9;
            if (nextPos - pos >= minGap)
                while (nextF && nextF.from < nextPos) {
                    let cut = nextF;
                    if (pos >= cut.from || nextPos <= cut.to || off) {
                        let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
                        cut = fFrom >= fTo ? null : new parse_TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
                    }
                    if (cut)
                        result.push(cut);
                    if (nextF.to > nextPos)
                        break;
                    nextF = fI < fragments.length ? fragments[fI++] : null;
                }
            if (!nextC)
                break;
            pos = nextC.toA;
            off = nextC.toA - nextC.toB;
        }
        return result;
    }
}
class Parser {
    startParse(input, fragments, ranges) {
        if (typeof input == "string")
            input = new StringInput(input);
        ranges = !ranges ? [new tree_Range(0, input.length)] : ranges.length ? ranges.map(r => new tree_Range(r.from, r.to)) : [new tree_Range(0, 0)];
        return this.createParse(input, fragments || [], ranges);
    }
    parse(input, fragments, ranges) {
        let parse = this.startParse(input, fragments, ranges);
        for (;;) {
            let done = parse.advance();
            if (done)
                return done;
        }
    }
}
class StringInput {
    constructor(string) {
        this.string = string;
    }
    get length() { return this.string.length; }
    chunk(from) { return this.string.slice(from); }
    get lineChunks() { return false; }
    read(from, to) { return this.string.slice(from, to); }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/common/mix.js


function parseMixed(nest) {
    return (parse, input, fragments, ranges) => new MixedParse(parse, nest, input, fragments, ranges);
}
class InnerParse {
    constructor(parser, parse, overlay, target, ranges) {
        this.parser = parser;
        this.parse = parse;
        this.overlay = overlay;
        this.target = target;
        this.ranges = ranges;
    }
}
class ActiveOverlay {
    constructor(parser, predicate, mounts, index, start, target, prev) {
        this.parser = parser;
        this.predicate = predicate;
        this.mounts = mounts;
        this.index = index;
        this.start = start;
        this.target = target;
        this.prev = prev;
        this.depth = 0;
        this.ranges = [];
    }
}
const stoppedInner = new tree_NodeProp({ perNode: true });
class MixedParse {
    constructor(base, nest, input, fragments, ranges) {
        this.nest = nest;
        this.input = input;
        this.fragments = fragments;
        this.ranges = ranges;
        this.inner = [];
        this.innerDone = 0;
        this.baseTree = null;
        this.stoppedAt = null;
        this.baseParse = base;
    }
    advance() {
        if (this.baseParse) {
            let done = this.baseParse.advance();
            if (!done)
                return null;
            this.baseParse = null;
            this.baseTree = done;
            this.startInner();
            if (this.stoppedAt != null)
                for (let inner of this.inner)
                    inner.parse.stopAt(this.stoppedAt);
        }
        if (this.innerDone == this.inner.length) {
            let result = this.baseTree;
            if (this.stoppedAt != null)
                result = new Tree(result.type, result.children, result.positions, result.length, result.propValues.concat([[stoppedInner, this.stoppedAt]]));
            return result;
        }
        let inner = this.inner[this.innerDone], done = inner.parse.advance();
        if (done) {
            this.innerDone++;
            // This is a somewhat dodgy but super helpful hack where we
            // patch up nodes created by the inner parse (and thus
            // presumably not aliased anywhere else) to hold the information
            // about the inner parse.
            let props = Object.assign(Object.create(null), inner.target.props);
            props[NodeProp.mounted.id] = new MountedTree(done, inner.overlay, inner.parser);
            inner.target.props = props;
        }
        return null;
    }
    get parsedPos() {
        if (this.baseParse)
            return 0;
        let pos = this.input.length;
        for (let i = this.innerDone; i < this.inner.length; i++) {
            if (this.inner[i].ranges[0].from < pos)
                pos = Math.min(pos, this.inner[i].parse.parsedPos);
        }
        return pos;
    }
    stopAt(pos) {
        this.stoppedAt = pos;
        if (this.baseParse)
            this.baseParse.stopAt(pos);
        else
            for (let i = this.innerDone; i < this.inner.length; i++)
                this.inner[i].parse.stopAt(pos);
    }
    startInner() {
        let fragmentCursor = new FragmentCursor(this.fragments);
        let overlay = null;
        let covered = null;
        let cursor = new TreeCursor(new TreeNode(this.baseTree, this.ranges[0].from, 0, null), IterMode.IncludeAnonymous | IterMode.IgnoreMounts);
        scan: for (let nest, isCovered; this.stoppedAt == null || cursor.from < this.stoppedAt;) {
            let enter = true, range;
            if (fragmentCursor.hasNode(cursor)) {
                if (overlay) {
                    let match = overlay.mounts.find(m => m.frag.from <= cursor.from && m.frag.to >= cursor.to && m.mount.overlay);
                    if (match)
                        for (let r of match.mount.overlay) {
                            let from = r.from + match.pos, to = r.to + match.pos;
                            if (from >= cursor.from && to <= cursor.to && !overlay.ranges.some(r => r.from < to && r.to > from))
                                overlay.ranges.push({ from, to });
                        }
                }
                enter = false;
            }
            else if (covered && (isCovered = checkCover(covered.ranges, cursor.from, cursor.to))) {
                enter = isCovered != 2 /* Full */;
            }
            else if (!cursor.type.isAnonymous && cursor.from < cursor.to && (nest = this.nest(cursor, this.input))) {
                if (!cursor.tree)
                    materialize(cursor);
                let oldMounts = fragmentCursor.findMounts(cursor.from, nest.parser);
                if (typeof nest.overlay == "function") {
                    overlay = new ActiveOverlay(nest.parser, nest.overlay, oldMounts, this.inner.length, cursor.from, cursor.tree, overlay);
                }
                else {
                    let ranges = punchRanges(this.ranges, nest.overlay || [new Range(cursor.from, cursor.to)]);
                    if (ranges.length)
                        this.inner.push(new InnerParse(nest.parser, nest.parser.startParse(this.input, enterFragments(oldMounts, ranges), ranges), nest.overlay ? nest.overlay.map(r => new Range(r.from - cursor.from, r.to - cursor.from)) : null, cursor.tree, ranges));
                    if (!nest.overlay)
                        enter = false;
                    else if (ranges.length)
                        covered = { ranges, depth: 0, prev: covered };
                }
            }
            else if (overlay && (range = overlay.predicate(cursor))) {
                if (range === true)
                    range = new Range(cursor.from, cursor.to);
                if (range.from < range.to)
                    overlay.ranges.push(range);
            }
            if (enter && cursor.firstChild()) {
                if (overlay)
                    overlay.depth++;
                if (covered)
                    covered.depth++;
            }
            else {
                for (;;) {
                    if (cursor.nextSibling())
                        break;
                    if (!cursor.parent())
                        break scan;
                    if (overlay && !--overlay.depth) {
                        let ranges = punchRanges(this.ranges, overlay.ranges);
                        if (ranges.length)
                            this.inner.splice(overlay.index, 0, new InnerParse(overlay.parser, overlay.parser.startParse(this.input, enterFragments(overlay.mounts, ranges), ranges), overlay.ranges.map(r => new Range(r.from - overlay.start, r.to - overlay.start)), overlay.target, ranges));
                        overlay = overlay.prev;
                    }
                    if (covered && !--covered.depth)
                        covered = covered.prev;
                }
            }
        }
    }
}
function checkCover(covered, from, to) {
    for (let range of covered) {
        if (range.from >= to)
            break;
        if (range.to > from)
            return range.from <= from && range.to >= to ? 2 /* Full */ : 1 /* Partial */;
    }
    return 0 /* None */;
}
// Take a piece of buffer and convert it into a stand-alone
// TreeBuffer.
function sliceBuf(buf, startI, endI, nodes, positions, off) {
    if (startI < endI) {
        let from = buf.buffer[startI + 1], to = buf.buffer[endI - 2];
        nodes.push(buf.slice(startI, endI, from, to));
        positions.push(from - off);
    }
}
// This function takes a node that's in a buffer, and converts it, and
// its parent buffer nodes, into a Tree. This is again acting on the
// assumption that the trees and buffers have been constructed by the
// parse that was ran via the mix parser, and thus aren't shared with
// any other code, making violations of the immutability safe.
function materialize(cursor) {
    let { node } = cursor, depth = 0;
    // Scan up to the nearest tree
    do {
        cursor.parent();
        depth++;
    } while (!cursor.tree);
    // Find the index of the buffer in that tree
    let i = 0, base = cursor.tree, off = 0;
    for (;; i++) {
        off = base.positions[i] + cursor.from;
        if (off <= node.from && off + base.children[i].length >= node.to)
            break;
    }
    let buf = base.children[i], b = buf.buffer;
    // Split a level in the buffer, putting the nodes before and after
    // the child that contains `node` into new buffers.
    function split(startI, endI, type, innerOffset, length) {
        let i = startI;
        while (b[i + 2] + off <= node.from)
            i = b[i + 3];
        let children = [], positions = [];
        sliceBuf(buf, startI, i, children, positions, innerOffset);
        let from = b[i + 1], to = b[i + 2];
        let isTarget = from + off == node.from && to + off == node.to && b[i] == node.type.id;
        children.push(isTarget ? node.toTree() : split(i + 4, b[i + 3], buf.set.types[b[i]], from, to - from));
        positions.push(from - innerOffset);
        sliceBuf(buf, b[i + 3], endI, children, positions, innerOffset);
        return new Tree(type, children, positions, length);
    }
    // Overwrite (!) the child at the buffer's index with the split-up tree
    ;
    base.children[i] = split(0, b.length, NodeType.none, 0, buf.length);
    // Move the cursor back to the target node
    for (let d = 0; d <= depth; d++)
        cursor.childAfter(node.from);
}
class StructureCursor {
    constructor(root, offset) {
        this.offset = offset;
        this.done = false;
        this.cursor = root.cursor(IterMode.IncludeAnonymous | IterMode.IgnoreMounts);
    }
    // Move to the first node (in pre-order) that starts at or after `pos`.
    moveTo(pos) {
        let { cursor } = this, p = pos - this.offset;
        while (!this.done && cursor.from < p) {
            if (cursor.to >= pos && cursor.enter(p, 1, IterMode.IgnoreOverlays | IterMode.ExcludeBuffers)) { }
            else if (!cursor.next(false))
                this.done = true;
        }
    }
    hasNode(cursor) {
        this.moveTo(cursor.from);
        if (!this.done && this.cursor.from + this.offset == cursor.from && this.cursor.tree) {
            for (let tree = this.cursor.tree;;) {
                if (tree == cursor.tree)
                    return true;
                if (tree.children.length && tree.positions[0] == 0 && tree.children[0] instanceof Tree)
                    tree = tree.children[0];
                else
                    break;
            }
        }
        return false;
    }
}
class FragmentCursor {
    constructor(fragments) {
        var _a;
        this.fragments = fragments;
        this.curTo = 0;
        this.fragI = 0;
        if (fragments.length) {
            let first = this.curFrag = fragments[0];
            this.curTo = (_a = first.tree.prop(stoppedInner)) !== null && _a !== void 0 ? _a : first.to;
            this.inner = new StructureCursor(first.tree, -first.offset);
        }
        else {
            this.curFrag = this.inner = null;
        }
    }
    hasNode(node) {
        while (this.curFrag && node.from >= this.curTo)
            this.nextFrag();
        return this.curFrag && this.curFrag.from <= node.from && this.curTo >= node.to && this.inner.hasNode(node);
    }
    nextFrag() {
        var _a;
        this.fragI++;
        if (this.fragI == this.fragments.length) {
            this.curFrag = this.inner = null;
        }
        else {
            let frag = this.curFrag = this.fragments[this.fragI];
            this.curTo = (_a = frag.tree.prop(stoppedInner)) !== null && _a !== void 0 ? _a : frag.to;
            this.inner = new StructureCursor(frag.tree, -frag.offset);
        }
    }
    findMounts(pos, parser) {
        var _a;
        let result = [];
        if (this.inner) {
            this.inner.cursor.moveTo(pos, 1);
            for (let pos = this.inner.cursor.node; pos; pos = pos.parent) {
                let mount = (_a = pos.tree) === null || _a === void 0 ? void 0 : _a.prop(NodeProp.mounted);
                if (mount && mount.parser == parser) {
                    for (let i = this.fragI; i < this.fragments.length; i++) {
                        let frag = this.fragments[i];
                        if (frag.from >= pos.to)
                            break;
                        if (frag.tree == this.curFrag.tree)
                            result.push({
                                frag,
                                pos: pos.from - frag.offset,
                                mount
                            });
                    }
                }
            }
        }
        return result;
    }
}
function punchRanges(outer, ranges) {
    let copy = null, current = ranges;
    for (let i = 1, j = 0; i < outer.length; i++) {
        let gapFrom = outer[i - 1].to, gapTo = outer[i].from;
        for (; j < current.length; j++) {
            let r = current[j];
            if (r.from >= gapTo)
                break;
            if (r.to <= gapFrom)
                continue;
            if (!copy)
                current = copy = ranges.slice();
            if (r.from < gapFrom) {
                copy[j] = new Range(r.from, gapFrom);
                if (r.to > gapTo)
                    copy.splice(j + 1, 0, new Range(gapTo, r.to));
            }
            else if (r.to > gapTo) {
                copy[j--] = new Range(gapTo, r.to);
            }
            else {
                copy.splice(j--, 1);
            }
        }
    }
    return current;
}
function findCoverChanges(a, b, from, to) {
    let iA = 0, iB = 0, inA = false, inB = false, pos = -1e9;
    let result = [];
    for (;;) {
        let nextA = iA == a.length ? 1e9 : inA ? a[iA].to : a[iA].from;
        let nextB = iB == b.length ? 1e9 : inB ? b[iB].to : b[iB].from;
        if (inA != inB) {
            let start = Math.max(pos, from), end = Math.min(nextA, nextB, to);
            if (start < end)
                result.push(new Range(start, end));
        }
        pos = Math.min(nextA, nextB);
        if (pos == 1e9)
            break;
        if (nextA == pos) {
            if (!inA)
                inA = true;
            else {
                inA = false;
                iA++;
            }
        }
        if (nextB == pos) {
            if (!inB)
                inB = true;
            else {
                inB = false;
                iB++;
            }
        }
    }
    return result;
}
// Given a number of fragments for the outer tree, and a set of ranges
// to parse, find fragments for inner trees mounted around those
// ranges, if any.
function enterFragments(mounts, ranges) {
    let result = [];
    for (let { pos, mount, frag } of mounts) {
        let startPos = pos + (mount.overlay ? mount.overlay[0].from : 0), endPos = startPos + mount.tree.length;
        let from = Math.max(frag.from, startPos), to = Math.min(frag.to, endPos);
        if (mount.overlay) {
            let overlay = mount.overlay.map(r => new Range(r.from + pos, r.to + pos));
            let changes = findCoverChanges(ranges, overlay, from, to);
            for (let i = 0, pos = from;; i++) {
                let last = i == changes.length, end = last ? to : changes[i].from;
                if (end > pos)
                    result.push(new TreeFragment(pos, end, mount.tree, -startPos, frag.from >= pos, frag.to <= end));
                if (last)
                    break;
                pos = changes[i].to;
            }
        }
        else {
            result.push(new TreeFragment(from, to, mount.tree, -startPos, frag.from >= startPos, frag.to <= endPos));
        }
    }
    return result;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/common/index.js




;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/language.js
var _a;



/** Node prop stored in a parser's top syntax node to provide the facet that stores language-specific data for that language. */
const languageDataProp = new tree_NodeProp();
/**
 * Helper function to define a facet (to be added to the top syntax node(s) for a language via
 * {@link languageDataProp}), that will be used to associate language data with the language.
 * You probably only need this when subclassing {@link Language}.
 */
function defineLanguageFacet(baseData) {
    return dist_state/* Facet.define */.r$.define({
        combine: baseData ? values => values.concat(baseData) : undefined
    });
}
/**
 * A language object manages parsing and per-language [metadata]{@link languageDataAt}.
 * Parse data is managed as a [Lezer](https://lezer.codemirror.net) tree. The class
 * can be used directly, via the {@link LRLanguage} subclass for
 * [Lezer](https://lezer.codemirror.net/) LR parsers, or via the {@link StreamLanguage}
 * subclass for stream parsers.
 */
class Language {
    /**
     * Construct a language object. If you need to invoke this directly, first define a data
     * facet with {@link defineLanguageFacet}, and then configure your parser to
     * [attach]{@link languageDataProp} it to the language's outer syntax node.
     * @param data The [language data]{@link languageDataAt} facet used for this language.
     * @param parser
     * @param extraExtensions
     */
    constructor(data, parser, extraExtensions = []) {
        this.data = data;
        // Kludge to define EditorState.tree as a debugging helper,
        // without the EditorState package actually knowing about
        // languages and lezer trees.
        if (!dist_state/* EditorState.prototype.hasOwnProperty */.yy.prototype.hasOwnProperty("tree"))
            Object.defineProperty(dist_state/* EditorState.prototype */.yy.prototype, "tree", { get() { return language_syntaxTree(this); } });
        this.parser = parser;
        this.extension = [
            language.of(this),
            dist_state/* EditorState.languageData.of */.yy.languageData.of((state, pos, side) => state.facet(languageDataFacetAt(state, pos, side)))
        ].concat(extraExtensions);
    }
    /** Query whether this language is active at the given position. */
    isActiveAt(state, pos, side = -1) {
        return languageDataFacetAt(state, pos, side) == this.data;
    }
    /**
     * Find the document regions that were parsed using this language.
     * The returned regions will _include_ any nested languages rooted
     * in this language, when those exist.
     */
    findRegions(state) {
        let lang = state.facet(language);
        if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
            return [{ from: 0, to: state.doc.length }];
        if (!lang || !lang.allowsNesting)
            return [];
        let result = [];
        let explore = (tree, from) => {
            if (tree.prop(languageDataProp) == this.data) {
                result.push({ from, to: from + tree.length });
                return;
            }
            let mount = tree.prop(tree_NodeProp.mounted);
            if (mount) {
                if (mount.tree.prop(languageDataProp) == this.data) {
                    if (mount.overlay)
                        for (let r of mount.overlay)
                            result.push({ from: r.from + from, to: r.to + from });
                    else
                        result.push({ from: from, to: from + tree.length });
                    return;
                }
                else if (mount.overlay) {
                    let size = result.length;
                    explore(mount.tree, mount.overlay[0].from + from);
                    if (result.length > size)
                        return;
                }
            }
            for (let i = 0; i < tree.children.length; i++) {
                let ch = tree.children[i];
                if (ch instanceof tree_Tree)
                    explore(ch, tree.positions[i] + from);
            }
        };
        explore(language_syntaxTree(state), 0);
        return result;
    }
    /** Indicates whether this language allows nested languages. The default implementation returns true. */
    get allowsNesting() { return true; }
}
// @internal
Language.setState = dist_state/* StateEffect.define */.Py.define();
function languageDataFacetAt(state, pos, side) {
    let topLang = state.facet(language);
    if (!topLang)
        return null;
    let facet = topLang.data;
    if (topLang.allowsNesting) {
        for (let node = language_syntaxTree(state).topNode; node; node = node.enter(pos, side, tree_IterMode.ExcludeBuffers))
            facet = node.type.prop(languageDataProp) || facet;
    }
    return facet;
}
/** A subclass of {@link Language} for use with Lezer [LR parsers](https://lezer.codemirror.net/docs/ref#lr.LRParser) parsers. */
class LRLanguage extends Language {
    constructor(data, parser) {
        super(data, parser);
        this.parser = parser;
    }
    /** Define a language from a parser. */
    static define(spec) {
        let data = defineLanguageFacet(spec.languageData);
        return new LRLanguage(data, spec.parser.configure({
            props: [languageDataProp.add(type => type.isTop ? data : undefined)]
        }));
    }
    /** Create a new instance of this language with a reconfigured version of its parser. */
    configure(options) {
        return new LRLanguage(this.data, this.parser.configure(options));
    }
    get allowsNesting() { return this.parser.hasWrappers(); }
}
/**
 * Get the syntax tree for a state, which is the current (possibly incomplete) parse tree of the
 * active [language]{@link Language}, or the empty tree if there is no language available.
 */
function language_syntaxTree(state) {
    let field = state.field(Language.state, false);
    return field ? field.tree : tree_Tree.empty;
}
/**
 * Try to get a parse tree that spans at least up to `upto`. The method will do at most `timeout`
 * milliseconds of work to parse up to that point if the tree isn't already available.
 */
function ensureSyntaxTree(state, upto, timeout = 50) {
    var _a;
    let parse = (_a = state.field(Language.state, false)) === null || _a === void 0 ? void 0 : _a.context;
    return !parse ? null : parse.isDone(upto) || parse.work(timeout, upto) ? parse.tree : null;
}
/**
 * Queries whether there is a full syntax tree available up to the given document position.
 * If there isn't, the background parse process _might_ still be working and update the tree
 * further, but there is no guarantee of that—the parser will [stop working]{@link syntaxParserRunning}
 * when it has spent a certain amount of time or has moved beyond the visible viewport.
 * Always returns false if no language has been enabled.
 */
function syntaxTreeAvailable(state, upto = state.doc.length) {
    var _a;
    return ((_a = state.field(Language.state, false)) === null || _a === void 0 ? void 0 : _a.context.isDone(upto)) || false;
}
/**
 * Move parsing forward, and update the editor state afterwards to reflect the new tree.
 * Will work for at most `timeout` milliseconds. Returns true if the parser managed get
 * to the given position in that time.
 */
function forceParsing(view, upto = view.viewport.to, timeout = 100) {
    let success = ensureSyntaxTree(view.state, upto, timeout);
    if (success != language_syntaxTree(view.state))
        view.dispatch({});
    return !!success;
}
/**
 * Tells you whether the language parser is planning to do more parsing work (in a
 * `requestIdleCallback` pseudo-thread) or has stopped running, either because it
 * parsed the entire document, because it spent too much time and was cut off, or
 * because there is no language parser enabled.
 */
function syntaxParserRunning(view) {
    var _a;
    return ((_a = view.plugin(parseWorker)) === null || _a === void 0 ? void 0 : _a.isWorking()) || false;
}
// Lezer-style Input object for a Text document.
class DocInput {
    constructor(doc, length = doc.length) {
        this.doc = doc;
        this.length = length;
        this.cursorPos = 0;
        this.string = "";
        this.cursor = doc.iter();
    }
    syncTo(pos) {
        this.string = this.cursor.next(pos - this.cursorPos).value;
        this.cursorPos = pos + this.string.length;
        return this.cursorPos - this.string.length;
    }
    chunk(pos) {
        this.syncTo(pos);
        return this.string;
    }
    get lineChunks() { return true; }
    read(from, to) {
        let stringStart = this.cursorPos - this.string.length;
        if (from < stringStart || to >= this.cursorPos)
            return this.doc.sliceString(from, to);
        else
            return this.string.slice(from - stringStart, to - stringStart);
    }
}
let currentContext = null;
/** A parse context provided to parsers working on the editor content. */
class ParseContext {
    constructor(parser, 
    /** The current editor state. */
    state, 
    /** Tree fragments that can be reused by incremental re-parses. */
    fragments = [], 
    // @internal
    tree, 
    // @internal
    treeLen, 
    /**
     * The current editor viewport (or some overapproximation thereof). Intended to be used
     * for opportunistically avoiding work (in which case {@link skipUntilInView} should be
     * called to make sure the parser is restarted when the skipped region becomes visible).
     */
    viewport, 
    // @internal
    skipped, 
    /**
     * This is where skipping parsers can register a promise that, when resolved, will
     * schedule a new parse. It is cleared when the parse worker picks up the promise.
     */
    scheduleOn) {
        this.parser = parser;
        this.state = state;
        this.fragments = fragments;
        this.tree = tree;
        this.treeLen = treeLen;
        this.viewport = viewport;
        this.skipped = skipped;
        this.scheduleOn = scheduleOn;
        this.parse = null;
        // @internal
        this.tempSkipped = [];
    }
    // @internal
    static create(parser, state, viewport) {
        return new ParseContext(parser, state, [], tree_Tree.empty, 0, viewport, [], null);
    }
    startParse() {
        return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
    }
    // @internal
    work(until, upto) {
        if (upto != null && upto >= this.state.doc.length)
            upto = undefined;
        if (this.tree != tree_Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
            this.takeTree();
            return true;
        }
        return this.withContext(() => {
            var _a;
            if (typeof until == "number") {
                let endTime = Date.now() + until;
                until = () => Date.now() > endTime;
            }
            if (!this.parse)
                this.parse = this.startParse();
            if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) &&
                upto < this.state.doc.length)
                this.parse.stopAt(upto);
            for (;;) {
                let done = this.parse.advance();
                if (done) {
                    this.fragments = this.withoutTempSkipped(parse_TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
                    this.treeLen = (_a = this.parse.stoppedAt) !== null && _a !== void 0 ? _a : this.state.doc.length;
                    this.tree = done;
                    this.parse = null;
                    if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
                        this.parse = this.startParse();
                    else
                        return true;
                }
                if (until())
                    return false;
            }
        });
    }
    // @internal
    takeTree() {
        let pos, tree;
        if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
            if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
                this.parse.stopAt(pos);
            this.withContext(() => { while (!(tree = this.parse.advance())) { } });
            this.treeLen = pos;
            this.tree = tree;
            this.fragments = this.withoutTempSkipped(parse_TreeFragment.addTree(this.tree, this.fragments, true));
            this.parse = null;
        }
    }
    withContext(f) {
        let prev = currentContext;
        currentContext = this;
        try {
            return f();
        }
        finally {
            currentContext = prev;
        }
    }
    withoutTempSkipped(fragments) {
        for (let r; r = this.tempSkipped.pop();)
            fragments = cutFragments(fragments, r.from, r.to);
        return fragments;
    }
    // @internal
    changes(changes, newState) {
        let { fragments, tree, treeLen, viewport, skipped } = this;
        this.takeTree();
        if (!changes.empty) {
            let ranges = [];
            changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
            fragments = parse_TreeFragment.applyChanges(fragments, ranges);
            tree = tree_Tree.empty;
            treeLen = 0;
            viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
            if (this.skipped.length) {
                skipped = [];
                for (let r of this.skipped) {
                    let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
                    if (from < to)
                        skipped.push({ from, to });
                }
            }
        }
        return new ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
    }
    // @internal
    updateViewport(viewport) {
        if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
            return false;
        this.viewport = viewport;
        let startLen = this.skipped.length;
        for (let i = 0; i < this.skipped.length; i++) {
            let { from, to } = this.skipped[i];
            if (from < viewport.to && to > viewport.from) {
                this.fragments = cutFragments(this.fragments, from, to);
                this.skipped.splice(i--, 1);
            }
        }
        if (this.skipped.length >= startLen)
            return false;
        this.reset();
        return true;
    }
    // @internal
    reset() {
        if (this.parse) {
            this.takeTree();
            this.parse = null;
        }
    }
    /**
     * Notify the parse scheduler that the given region was skipped because it wasn't in view,
     * and the parse should be restarted when it comes into view.
     */
    skipUntilInView(from, to) {
        this.skipped.push({ from, to });
    }
    /**
     * Returns a parser intended to be used as placeholder when asynchronously loading a nested
     * parser. It'll skip its input and mark it as not-really-parsed, so that the next update
     * will parse it again.
     * @param until a reparse will be scheduled when the promise resolves.
     */
    static getSkippingParser(until) {
        return new class extends Parser {
            createParse(input, fragments, ranges) {
                let from = ranges[0].from, to = ranges[ranges.length - 1].to;
                let parser = {
                    parsedPos: from,
                    advance() {
                        let cx = currentContext;
                        if (cx) {
                            for (let r of ranges)
                                cx.tempSkipped.push(r);
                            if (until)
                                cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
                        }
                        this.parsedPos = to;
                        return new tree_Tree(tree_NodeType.none, [], [], to - from);
                    },
                    stoppedAt: null,
                    stopAt() { }
                };
                return parser;
            }
        };
    }
    // @internal
    isDone(upto) {
        upto = Math.min(upto, this.state.doc.length);
        let frags = this.fragments;
        return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
    }
    /** Get the context for the current parse, or `null` if no editor parse is in progress. */
    static get() { return currentContext; }
}
function cutFragments(fragments, from, to) {
    return parse_TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
}
class LanguageState {
    constructor(
    // A mutable parse state that is used to preserve work done during
    // the lifetime of a state when moving to the next state.
    context) {
        this.context = context;
        this.tree = context.tree;
    }
    apply(tr) {
        if (!tr.docChanged && this.tree == this.context.tree)
            return this;
        let newCx = this.context.changes(tr.changes, tr.state);
        // If the previous parse wasn't done, go forward only up to its
        // end position or the end of the viewport, to avoid slowing down
        // state updates with parse work beyond the viewport.
        let upto = this.context.treeLen == tr.startState.doc.length ? undefined
            : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
        if (!newCx.work(20 /* Apply */, upto))
            newCx.takeTree();
        return new LanguageState(newCx);
    }
    static init(state) {
        let vpTo = Math.min(3000 /* InitViewport */, state.doc.length);
        let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
        if (!parseState.work(20 /* Apply */, vpTo))
            parseState.takeTree();
        return new LanguageState(parseState);
    }
}
Language.state = dist_state/* StateField.define */.QQ.define({
    create: LanguageState.init,
    update(value, tr) {
        for (let e of tr.effects)
            if (e.is(Language.setState))
                return e.value;
        if (tr.startState.facet(language) != tr.state.facet(language))
            return LanguageState.init(tr.state);
        return value.apply(tr);
    }
});
let requestIdle = (callback) => {
    let timeout = setTimeout(() => callback(), 500 /* MaxPause */);
    return () => clearTimeout(timeout);
};
if (typeof requestIdleCallback != "undefined")
    requestIdle = (callback) => {
        let idle = -1, timeout = setTimeout(() => {
            idle = requestIdleCallback(callback, { timeout: 500 /* MaxPause */ - 100 /* MinPause */ });
        }, 100 /* MinPause */);
        return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
    };
const isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending)
    ? () => navigator.scheduling.isInputPending() : null;
const parseWorker = extension/* ViewPlugin.fromClass */.lg.fromClass(class ParseWorker {
    constructor(view) {
        this.view = view;
        this.working = null;
        this.workScheduled = 0;
        // End of the current time chunk
        this.chunkEnd = -1;
        // Milliseconds of budget left for this chunk
        this.chunkBudget = -1;
        this.work = this.work.bind(this);
        this.scheduleWork();
    }
    update(update) {
        let cx = this.view.state.field(Language.state).context;
        if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
            this.scheduleWork();
        if (update.docChanged) {
            if (this.view.hasFocus)
                this.chunkBudget += 50 /* ChangeBonus */;
            this.scheduleWork();
        }
        this.checkAsyncSchedule(cx);
    }
    scheduleWork() {
        if (this.working)
            return;
        let { state } = this.view, field = state.field(Language.state);
        if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
            this.working = requestIdle(this.work);
    }
    work(deadline) {
        this.working = null;
        let now = Date.now();
        if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) { // Start a new chunk
            this.chunkEnd = now + 30000 /* ChunkTime */;
            this.chunkBudget = 3000 /* ChunkBudget */;
        }
        if (this.chunkBudget <= 0)
            return; // No more budget
        let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
        if (field.tree == field.context.tree && field.context.isDone(vpTo + 100000 /* MaxParseAhead */))
            return;
        let endTime = Date.now() + Math.min(this.chunkBudget, 100 /* Slice */, deadline && !isInputPending ? Math.max(25 /* MinSlice */, deadline.timeRemaining() - 5) : 1e9);
        let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1000;
        let done = field.context.work(() => {
            return isInputPending && isInputPending() || Date.now() > endTime;
        }, vpTo + (viewportFirst ? 0 : 100000 /* MaxParseAhead */));
        this.chunkBudget -= Date.now() - now;
        if (done || this.chunkBudget <= 0) {
            field.context.takeTree();
            this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
        }
        if (this.chunkBudget > 0 && !(done && !viewportFirst))
            this.scheduleWork();
        this.checkAsyncSchedule(field.context);
    }
    checkAsyncSchedule(cx) {
        if (cx.scheduleOn) {
            this.workScheduled++;
            cx.scheduleOn
                .then(() => this.scheduleWork())
                .catch(err => (0,extension/* logException */.OO)(this.view.state, err))
                .then(() => this.workScheduled--);
            cx.scheduleOn = null;
        }
    }
    destroy() {
        if (this.working)
            this.working();
    }
    isWorking() {
        return !!(this.working || this.workScheduled > 0);
    }
}, {
    eventHandlers: { focus() { this.scheduleWork(); } }
});
/** The facet used to associate a language with an editor state. */
const language = dist_state/* Facet.define */.r$.define({
    combine(languages) { return languages.length ? languages[0] : null; },
    enables: [Language.state, parseWorker]
});
/**
 * This class bundles a {@link language} with an optional set of supporting extensions.
 * Language packages are encouraged to export a function that optionally takes a
 * configuration object and returns a `LanguageSupport` instance, as the main way for
 * client code to use the package.
 */
class LanguageSupport {
    /** Create a language support object. */
    constructor(
    /** The language object. */
    language, 
    /**
     * An optional set of supporting extensions. When nesting a language in another
     * language, the outer language is encouraged to include the supporting extensions
     * for its inner languages in its own set of support extensions.
     */
    support = []) {
        this.language = language;
        this.support = support;
        this.extension = [language, support];
    }
}
/**
 * Language descriptions are used to store metadata about languages and to dynamically load them.
 * Their main role is finding the appropriate language for a filename or dynamically loading
 * nested parsers.
 */
class LanguageDescription {
    constructor(
    /** The name of this language. */
    name, 
    /** Alternative names for the mode (lowercased, includes `this.name`). */
    alias, 
    /** File extensions associated with this language. */
    extensions, 
    /** Optional filename pattern that should be associated with this language. */
    filename, loadFunc, 
    /** If the language has been loaded, this will hold its value. */
    support = undefined) {
        this.name = name;
        this.alias = alias;
        this.extensions = extensions;
        this.filename = filename;
        this.loadFunc = loadFunc;
        this.support = support;
        this.loading = null;
    }
    /**
     * Start loading the the language. Will return a promise that resolves to a
     * {@link LanguageSupport} object when the language successfully loads.
     */
    load() {
        return this.loading || (this.loading = this.loadFunc().then(support => this.support = support, err => { this.loading = null; throw err; }));
    }
    /**
     * Create a language description.
     * @param spec.name The language's name.
     * @param [spec.alias] An optional array of alternative names.
     * @param [spec.extensions] An optional array of filename extensions associated with this language.
     * @param [spec.filename] An optional filename pattern associated with this language.
     * @param [spec.load] A function that will asynchronously load the language.
     * @param [spec.support] Alternatively to `load`, you can provide an already loaded support object. Either this or `load` should be provided.
     */
    static of(spec) {
        let { load, support } = spec;
        if (!load) {
            if (!support)
                throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of");
            load = () => Promise.resolve(support);
        }
        return new LanguageDescription(spec.name, (spec.alias || []).concat(spec.name).map(s => s.toLowerCase()), spec.extensions || [], spec.filename, load, support);
    }
    /**
     * Look for a language in the given array of descriptions that matches the filename.
     * Will first match {@link filename} patterns, and then {@link extensions}, and return
     * the first language that matches.
     */
    static matchFilename(descs, filename) {
        for (let d of descs)
            if (d.filename && d.filename.test(filename))
                return d;
        let ext = /\.([^.]+)$/.exec(filename);
        if (ext)
            for (let d of descs)
                if (d.extensions.indexOf(ext[1]) > -1)
                    return d;
        return null;
    }
    /**
     * Look for a language whose name or alias matches the the given name (case-insensitively).
     * If `fuzzy` is true, and no direct matchs is found, this'll also search for a language
     * whose name or alias occurs in the string (for names shorter than three characters, only
     * when surrounded by non-word characters).
     */
    static matchLanguageName(descs, name, fuzzy = true) {
        name = name.toLowerCase();
        for (let d of descs)
            if (d.alias.some(a => a == name))
                return d;
        if (fuzzy)
            for (let d of descs)
                for (let a of d.alias) {
                    let found = name.indexOf(a);
                    if (found > -1 && (a.length > 2 || !/\w/.test(name[found - 1]) && !/\w/.test(name[found + a.length])))
                        return d;
                }
        return null;
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/indent.js



const indentService = dist_state/* Facet.define */.r$.define();
const indentUnit = dist_state/* Facet.define */.r$.define({
    combine: values => {
        if (!values.length)
            return "  ";
        if (!/^(?: +|\t+)$/.test(values[0]))
            throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
        return values[0];
    }
});
function getIndentUnit(state) {
    let unit = state.facet(indentUnit);
    return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
}
function indentString(state, cols) {
    let result = "", ts = state.tabSize;
    if (state.facet(indentUnit).charCodeAt(0) == 9)
        while (cols >= ts) {
            result += "\t";
            cols -= ts;
        }
    for (let i = 0; i < cols; i++)
        result += " ";
    return result;
}
function getIndentation(context, pos) {
    if (context instanceof dist_state/* EditorState */.yy)
        context = new IndentContext(context);
    for (let service of context.state.facet(indentService)) {
        let result = service(context, pos);
        if (result != null)
            return result;
    }
    let tree = language_syntaxTree(context.state);
    return tree ? syntaxIndentation(context, tree, pos) : null;
}
class IndentContext {
    constructor(state, 
    // @internal
    options = {}) {
        this.state = state;
        this.options = options;
        this.unit = getIndentUnit(state);
    }
    lineAt(pos, bias = 1) {
        let line = this.state.doc.lineAt(pos);
        let { simulateBreak, simulateDoubleBreak } = this.options;
        if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
            if (simulateDoubleBreak && simulateBreak == pos)
                return { text: "", from: pos };
            else if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
                return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
            else
                return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
        }
        return line;
    }
    textAfterPos(pos, bias = 1) {
        if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
            return "";
        let { text, from } = this.lineAt(pos, bias);
        return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
    }
    column(pos, bias = 1) {
        let { text, from } = this.lineAt(pos, bias);
        let result = this.countColumn(text, pos - from);
        let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
        if (override > -1)
            result += override - this.countColumn(text, text.search(/\S|$/));
        return result;
    }
    countColumn(line, pos = line.length) {
        return (0,dist_state/* countColumn */.IS)(line, this.state.tabSize, pos);
    }
    lineIndent(pos, bias = 1) {
        let { text, from } = this.lineAt(pos, bias);
        let override = this.options.overrideIndentation;
        if (override) {
            let overriden = override(from);
            if (overriden > -1)
                return overriden;
        }
        return this.countColumn(text, text.search(/\S|$/));
    }
    get simulatedBreak() {
        return this.options.simulateBreak || null;
    }
}
const indentNodeProp = new tree_NodeProp();
// Compute the indentation for a given position from the syntax tree.
function syntaxIndentation(cx, ast, pos) {
    return indentFrom(ast.resolveInner(pos).enterUnfinishedNodesBefore(pos), pos, cx);
}
function ignoreClosed(cx) {
    return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
}
function indentStrategy(tree) {
    let strategy = tree.type.prop(indentNodeProp);
    if (strategy)
        return strategy;
    let first = tree.firstChild, close;
    if (first && (close = first.type.prop(tree_NodeProp.closedBy))) {
        let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
        return cx => delimitedStrategy(cx, true, 1, undefined, closed && !ignoreClosed(cx) ? last.from : undefined);
    }
    return tree.parent == null ? topIndent : null;
}
function indentFrom(node, pos, base) {
    for (; node; node = node.parent) {
        let strategy = indentStrategy(node);
        if (strategy)
            return strategy(TreeIndentContext.create(base, pos, node));
    }
    return null;
}
function topIndent() { return 0; }
class TreeIndentContext extends IndentContext {
    constructor(base, pos, node) {
        super(base.state, base.options);
        this.base = base;
        this.pos = pos;
        this.node = node;
    }
    // @internal
    static create(base, pos, node) {
        return new TreeIndentContext(base, pos, node);
    }
    get textAfter() {
        return this.textAfterPos(this.pos);
    }
    get baseIndent() {
        let line = this.state.doc.lineAt(this.node.from);
        // Skip line starts that are covered by a sibling (or cousin, etc)
        for (;;) {
            let atBreak = this.node.resolve(line.from);
            while (atBreak.parent && atBreak.parent.from == atBreak.from)
                atBreak = atBreak.parent;
            if (isParent(atBreak, this.node))
                break;
            line = this.state.doc.lineAt(atBreak.from);
        }
        return this.lineIndent(line.from);
    }
    continue() {
        let parent = this.node.parent;
        return parent ? indentFrom(parent, this.pos, this.base) : 0;
    }
}
function isParent(parent, of) {
    for (let cur = of; cur; cur = cur.parent)
        if (parent == cur)
            return true;
    return false;
}
// Check whether a delimited node is aligned (meaning there are
// non-skipped nodes on the same line as the opening delimiter). And
// if so, return the opening token.
function bracketedAligned(context) {
    let tree = context.node;
    let openToken = tree.childAfter(tree.from), last = tree.lastChild;
    if (!openToken)
        return null;
    let sim = context.options.simulateBreak;
    let openLine = context.state.doc.lineAt(openToken.from);
    let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
    for (let pos = openToken.to;;) {
        let next = tree.childAfter(pos);
        if (!next || next == last)
            return null;
        if (!next.type.isSkipped)
            return next.from < lineEnd ? openToken : null;
        pos = next.to;
    }
}
function delimitedIndent({ closing, align = true, units = 1 }) {
    return (context) => delimitedStrategy(context, align, units, closing);
}
function delimitedStrategy(context, align, units, closing, closedAt) {
    let after = context.textAfter, space = after.match(/^\s*/)[0].length;
    let closed = closing && after.slice(space, space + closing.length) == closing || closedAt == context.pos + space;
    let aligned = align ? bracketedAligned(context) : null;
    if (aligned)
        return closed ? context.column(aligned.from) : context.column(aligned.to);
    return context.baseIndent + (closed ? 0 : context.unit * units);
}
const flatIndent = (context) => context.baseIndent;
function continuedIndent({ except, units = 1 } = {}) {
    return (context) => {
        let matchExcept = except && except.test(context.textAfter);
        return context.baseIndent + (matchExcept ? 0 : units * context.unit);
    };
}
const DontIndentBeyond = 200;
/**
 * Enables reindentation on input. When a language defines an `indentOnInput` field in its
 * [language data]{@link EditorState.languageDataAt}, which must hold a regular expression,
 * the line at the cursor will be reindented whenever new text is typed and the input from
 * the start of the line up to the cursor matches that regexp.
 *
 * To avoid unneccesary reindents, it is recommended to start the regexp with `^` (usually followed by
 * `\s*`), and end it with `$`. For example, `/^\s*\}$/` will reindent when a closing brace is added at
 * the start of a line.
 */
function indentOnInput() {
    return dist_state/* EditorState.transactionFilter.of */.yy.transactionFilter.of(tr => {
        if (!tr.docChanged || !tr.isUserEvent("input.type") && !tr.isUserEvent("input.complete"))
            return tr;
        let rules = tr.startState.languageDataAt("indentOnInput", tr.startState.selection.main.head);
        if (!rules.length)
            return tr;
        let doc = tr.newDoc, { head } = tr.newSelection.main, line = doc.lineAt(head);
        if (head > line.from + DontIndentBeyond)
            return tr;
        let lineStart = doc.sliceString(line.from, head);
        if (!rules.some(r => r.test(lineStart)))
            return tr;
        let { state } = tr, last = -1, changes = [];
        for (let { head } of state.selection.ranges) {
            let line = state.doc.lineAt(head);
            if (line.from == last)
                continue;
            last = line.from;
            let indent = getIndentation(state, line.from);
            if (indent == null)
                continue;
            let cur = /^\s*/.exec(line.text)[0];
            let norm = indentString(state, indent);
            if (cur != norm)
                changes.push({ from: line.from, to: line.from + cur.length, insert: norm });
        }
        return changes.length ? [tr, { changes, sequential: true }] : tr;
    });
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/fold.js




/**
 * A facet that registers a code folding service. When called with the extent of a line,
 * such a function should return a foldable range that starts on that line (but continues
 * beyond it), if one can be found.
 */
const foldService = dist_state/* Facet.define */.r$.define();
/**
 * This node prop is used to associate folding information with syntax node types. Given a
 * syntax node, it should check whether that tree is foldable and return the range that can
 * be collapsed when it is.
 */
const foldNodeProp = new tree_NodeProp();
/**
 * [Fold](#language.foldNodeProp) function that folds everything but the first and the last
 * child of a syntax node. Useful for nodes that start and end with delimiters.
 */
function foldInside(node) {
    let first = node.firstChild, last = node.lastChild;
    return first && first.to < last.from ? { from: first.to, to: last.type.isError ? node.to : last.from } : null;
}
function syntaxFolding(state, start, end) {
    let tree = language_syntaxTree(state);
    if (tree.length < end)
        return null;
    let inner = tree.resolveInner(end);
    let found = null;
    for (let cur = inner; cur; cur = cur.parent) {
        if (cur.to <= end || cur.from > end)
            continue;
        if (found && cur.from < start)
            break;
        let prop = cur.type.prop(foldNodeProp);
        if (prop && (cur.to < tree.length - 50 || tree.length == state.doc.length || !isUnfinished(cur))) {
            let value = prop(cur, state);
            if (value && value.from <= end && value.from >= start && value.to > end)
                found = value;
        }
    }
    return found;
}
function isUnfinished(node) {
    let ch = node.lastChild;
    return ch && ch.to == node.to && ch.type.isError;
}
/**
 * Check whether the given line is foldable. First asks any fold services registered through
 * {@link foldService}, and if none of them return a result, tries to query the
 * [fold node prop]{@link foldNodeProp} of syntax nodes that cover the end of the line.
 */
function foldable(state, lineStart, lineEnd) {
    for (let service of state.facet(foldService)) {
        let result = service(state, lineStart, lineEnd);
        if (result)
            return result;
    }
    return syntaxFolding(state, lineStart, lineEnd);
}
function mapRange(range, mapping) {
    let from = mapping.mapPos(range.from, 1), to = mapping.mapPos(range.to, -1);
    return from >= to ? undefined : { from, to };
}
/**
 * State effect that can be attached to a transaction to fold the given range. (You probably
 * only need this in exceptional circumstances—usually you'll just want to let
 * {@link foldCode} and the [fold gutter]{@link foldGutter} create the transactions.)
 */
const foldEffect = dist_state/* StateEffect.define */.Py.define({ map: mapRange });
/** State effect that unfolds the given range (if it was folded). */
const unfoldEffect = dist_state/* StateEffect.define */.Py.define({ map: mapRange });
function selectedLines(view) {
    let lines = [];
    for (let { head } of view.state.selection.ranges) {
        if (lines.some(l => l.from <= head && l.to >= head))
            continue;
        lines.push(view.lineBlockAt(head));
    }
    return lines;
}
const foldState = dist_state/* StateField.define */.QQ.define({
    create() {
        return decoration/* Decoration.none */.p.none;
    },
    update(folded, tr) {
        folded = folded.map(tr.changes);
        for (let e of tr.effects) {
            if (e.is(foldEffect) && !foldExists(folded, e.value.from, e.value.to))
                folded = folded.update({ add: [foldWidget.range(e.value.from, e.value.to)] });
            else if (e.is(unfoldEffect))
                folded = folded.update({ filter: (from, to) => e.value.from != from || e.value.to != to,
                    filterFrom: e.value.from, filterTo: e.value.to });
        }
        // Clear folded ranges that cover the selection head
        if (tr.selection) {
            let onSelection = false, { head } = tr.selection.main;
            folded.between(head, head, (a, b) => { if (a < head && b > head)
                onSelection = true; });
            if (onSelection)
                folded = folded.update({
                    filterFrom: head,
                    filterTo: head,
                    filter: (a, b) => b <= head || a >= head
                });
        }
        return folded;
    },
    provide: f => editorview/* EditorView.decorations.from */.t.decorations.from(f)
});
/** Get a [range set](#state.RangeSet) containing the folded range in the given state. */
function foldedRanges(state) {
    return state.field(foldState, false) || RangeSet.empty;
}
function findFold(state, from, to) {
    var _a;
    let found = null;
    (_a = state.field(foldState, false)) === null || _a === void 0 ? void 0 : _a.between(from, to, (from, to) => {
        if (!found || found.from > from)
            found = { from, to };
    });
    return found;
}
function foldExists(folded, from, to) {
    let found = false;
    folded.between(from, from, (a, b) => { if (a == from && b == to)
        found = true; });
    return found;
}
function maybeEnable(state, other) {
    return state.field(foldState, false) ? other : other.concat(dist_state/* StateEffect.appendConfig.of */.Py.appendConfig.of(codeFolding()));
}
/** Fold the lines that are selected, if possible. */
const foldCode = view => {
    for (let line of selectedLines(view)) {
        let range = foldable(view.state, line.from, line.to);
        if (range) {
            view.dispatch({ effects: maybeEnable(view.state, [foldEffect.of(range), announceFold(view, range)]) });
            return true;
        }
    }
    return false;
};
/** Unfold folded ranges on selected lines. */
const unfoldCode = view => {
    if (!view.state.field(foldState, false))
        return false;
    let effects = [];
    for (let line of selectedLines(view)) {
        let folded = findFold(view.state, line.from, line.to);
        if (folded)
            effects.push(unfoldEffect.of(folded), announceFold(view, folded, false));
    }
    if (effects.length)
        view.dispatch({ effects });
    return effects.length > 0;
};
function announceFold(view, range, fold = true) {
    let lineFrom = view.state.doc.lineAt(range.from).number, lineTo = view.state.doc.lineAt(range.to).number;
    return editorview/* EditorView.announce.of */.t.announce.of(`${view.state.phrase(fold ? "Folded lines" : "Unfolded lines")} ${lineFrom} ${view.state.phrase("to")} ${lineTo}.`);
}
/**
 * Fold all top-level foldable ranges. Note that, in most cases, folding information will depend
 * on the [syntax tree]{@link syntaxTree}, and folding everything may not work reliably when the
 * document hasn't been fully parsed (either because the editor state was only just initialized,
 * or because the document is so big that the parser decided not to parse it entirely).
 */
const foldAll = view => {
    let { state } = view, effects = [];
    for (let pos = 0; pos < state.doc.length;) {
        let line = view.lineBlockAt(pos), range = foldable(state, line.from, line.to);
        if (range)
            effects.push(foldEffect.of(range));
        pos = (range ? view.lineBlockAt(range.to) : line).to + 1;
    }
    if (effects.length)
        view.dispatch({ effects: maybeEnable(view.state, effects) });
    return !!effects.length;
};
/** Unfold all folded code. */
const unfoldAll = view => {
    let field = view.state.field(foldState, false);
    if (!field || !field.size)
        return false;
    let effects = [];
    field.between(0, view.state.doc.length, (from, to) => { effects.push(unfoldEffect.of({ from, to })); });
    view.dispatch({ effects });
    return true;
};
/**
 * Default fold-related key bindings.
 *  - Ctrl-Shift-[ (Cmd-Alt-[ on macOS): {@link foldCode}.
 *  - Ctrl-Shift-] (Cmd-Alt-] on macOS): {@link unfoldCode}.
 *  - Ctrl-Alt-[: {@link foldAll}.
 *  - Ctrl-Alt-]: {@link unfoldAll}.
 */
const foldKeymap = [
    { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: foldCode },
    { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: unfoldCode },
    { key: "Ctrl-Alt-[", run: foldAll },
    { key: "Ctrl-Alt-]", run: unfoldAll }
];
const defaultConfig = {
    placeholderDOM: null,
    placeholderText: "…"
};
const foldConfig = dist_state/* Facet.define */.r$.define({
    combine(values) { return (0,dist_state/* combineConfig */.BO)(values, defaultConfig); }
});
/** Create an extension that configures code folding. */
function codeFolding(config) {
    let result = [foldState, fold_baseTheme];
    if (config)
        result.push(foldConfig.of(config));
    return result;
}
const foldWidget = decoration/* Decoration.replace */.p.replace({ widget: new class extends decoration/* WidgetType */.l9 {
        toDOM(view) {
            let { state } = view, conf = state.facet(foldConfig);
            let onclick = (event) => {
                let line = view.lineBlockAt(view.posAtDOM(event.target));
                let folded = findFold(view.state, line.from, line.to);
                if (folded)
                    view.dispatch({ effects: unfoldEffect.of(folded) });
                event.preventDefault();
            };
            if (conf.placeholderDOM)
                return conf.placeholderDOM(view, onclick);
            let element = document.createElement("span");
            element.textContent = conf.placeholderText;
            element.setAttribute("aria-label", state.phrase("folded code"));
            element.title = state.phrase("unfold");
            element.className = "cm-foldPlaceholder";
            element.onclick = onclick;
            return element;
        }
    } });
const foldGutterDefaults = {
    openText: "⌄",
    closedText: "›",
    markerDOM: null,
    domEventHandlers: {},
};
class FoldMarker extends GutterMarker {
    constructor(config, open) {
        super();
        this.config = config;
        this.open = open;
    }
    eq(other) { return this.config == other.config && this.open == other.open; }
    toDOM(view) {
        if (this.config.markerDOM)
            return this.config.markerDOM(this.open);
        let span = document.createElement("span");
        span.textContent = this.open ? this.config.openText : this.config.closedText;
        span.title = view.state.phrase(this.open ? "Fold line" : "Unfold line");
        return span;
    }
}
/**
 * Create an extension that registers a fold gutter, which shows a fold status indicator before
 * foldable lines (which can be clicked to fold or unfold the line).
 */
function foldGutter(config = {}) {
    let fullConfig = Object.assign(Object.assign({}, foldGutterDefaults), config);
    let canFold = new FoldMarker(fullConfig, true), canUnfold = new FoldMarker(fullConfig, false);
    let markers = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
        constructor(view) {
            this.from = view.viewport.from;
            this.markers = this.buildMarkers(view);
        }
        update(update) {
            if (update.docChanged || update.viewportChanged ||
                update.startState.facet(language) != update.state.facet(language) ||
                update.startState.field(foldState, false) != update.state.field(foldState, false) ||
                language_syntaxTree(update.startState) != language_syntaxTree(update.state))
                this.markers = this.buildMarkers(update.view);
        }
        buildMarkers(view) {
            let builder = new dist_state/* RangeSetBuilder */.f_();
            for (let line of view.viewportLineBlocks) {
                let mark = findFold(view.state, line.from, line.to) ? canUnfold :
                    foldable(view.state, line.from, line.to) ? canFold : null;
                if (mark)
                    builder.add(line.from, line.from, mark);
            }
            return builder.finish();
        }
    });
    let { domEventHandlers } = fullConfig;
    return [
        markers,
        gutter({
            class: "cm-foldGutter",
            markers(view) { var _a; return ((_a = view.plugin(markers)) === null || _a === void 0 ? void 0 : _a.markers) || dist_state/* RangeSet.empty */.Xs.empty; },
            initialSpacer() {
                return new FoldMarker(fullConfig, false);
            },
            domEventHandlers: Object.assign(Object.assign({}, domEventHandlers), { click: (view, line, event) => {
                    if (domEventHandlers.click && domEventHandlers.click(view, line, event))
                        return true;
                    let folded = findFold(view.state, line.from, line.to);
                    if (folded) {
                        view.dispatch({ effects: unfoldEffect.of(folded) });
                        return true;
                    }
                    let range = foldable(view.state, line.from, line.to);
                    if (range) {
                        view.dispatch({ effects: foldEffect.of(range) });
                        return true;
                    }
                    return false;
                } })
        }),
        codeFolding()
    ];
}
const fold_baseTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-foldPlaceholder": {
        backgroundColor: "#eee",
        border: "1px solid #ddd",
        color: "#888",
        borderRadius: ".2em",
        margin: "0 1px",
        padding: "0 1px",
        cursor: "pointer"
    },
    ".cm-foldGutter span": {
        padding: "0 1px",
        cursor: "pointer"
    }
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/highlight/highlight.js

let nextTagID = 0;
class Tag {
    // @internal
    constructor(set, base, modified) {
        this.set = set;
        this.base = base;
        this.modified = modified;
        // @internal
        this.id = nextTagID++;
    }
    static define(parent) {
        if (parent === null || parent === void 0 ? void 0 : parent.base)
            throw new Error("Can not derive from a modified tag");
        let tag = new Tag([], null, []);
        tag.set.push(tag);
        if (parent)
            for (let t of parent.set)
                tag.set.push(t);
        return tag;
    }
    static defineModifier() {
        let mod = new Modifier;
        return (tag) => {
            if (tag.modified.indexOf(mod) > -1)
                return tag;
            return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
        };
    }
}
let nextModifierID = 0;
class Modifier {
    constructor() {
        this.instances = [];
        this.id = nextModifierID++;
    }
    static get(base, mods) {
        if (!mods.length)
            return base;
        let exists = mods[0].instances.find(t => t.base == base && sameArray(mods, t.modified));
        if (exists)
            return exists;
        let set = [], tag = new Tag(set, base, mods);
        for (let m of mods)
            m.instances.push(tag);
        let configs = permute(mods);
        for (let parent of base.set)
            for (let config of configs)
                set.push(Modifier.get(parent, config));
        return tag;
    }
}
function sameArray(a, b) {
    return a.length == b.length && a.every((x, i) => x == b[i]);
}
function permute(array) {
    let result = [array];
    for (let i = 0; i < array.length; i++) {
        for (let a of permute(array.slice(0, i).concat(array.slice(i + 1))))
            result.push(a);
    }
    return result;
}
function styleTags(spec) {
    let byName = Object.create(null);
    for (let prop in spec) {
        let tags = spec[prop];
        if (!Array.isArray(tags))
            tags = [tags];
        for (let part of prop.split(" "))
            if (part) {
                let pieces = [], mode = 2 /* Normal */, rest = part;
                for (let pos = 0;;) {
                    if (rest == "..." && pos > 0 && pos + 3 == part.length) {
                        mode = 1 /* Inherit */;
                        break;
                    }
                    let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
                    if (!m)
                        throw new RangeError("Invalid path: " + part);
                    pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
                    pos += m[0].length;
                    if (pos == part.length)
                        break;
                    let next = part[pos++];
                    if (pos == part.length && next == "!") {
                        mode = 0 /* Opaque */;
                        break;
                    }
                    if (next != "/")
                        throw new RangeError("Invalid path: " + part);
                    rest = part.slice(pos);
                }
                let last = pieces.length - 1, inner = pieces[last];
                if (!inner)
                    throw new RangeError("Invalid path: " + part);
                let rule = new Rule(tags, mode, last > 0 ? pieces.slice(0, last) : null);
                byName[inner] = rule.sort(byName[inner]);
            }
    }
    return ruleNodeProp.add(byName);
}
const ruleNodeProp = new tree_NodeProp();
class Rule {
    constructor(tags, mode, context, next) {
        this.tags = tags;
        this.mode = mode;
        this.context = context;
        this.next = next;
    }
    sort(other) {
        if (!other || other.depth < this.depth) {
            this.next = other;
            return this;
        }
        other.next = this.sort(other.next);
        return other;
    }
    get depth() { return this.context ? this.context.length : 0; }
}
function tagHighlighter(tags, options) {
    let map = Object.create(null);
    for (let style of tags) {
        if (!Array.isArray(style.tag))
            map[style.tag.id] = style.class;
        else
            for (let tag of style.tag)
                map[tag.id] = style.class;
    }
    let { scope, all = null } = options || {};
    return {
        style: (tags) => {
            let cls = all;
            for (let tag of tags) {
                for (let sub of tag.set) {
                    let tagClass = map[sub.id];
                    if (tagClass) {
                        cls = cls ? cls + " " + tagClass : tagClass;
                        break;
                    }
                }
            }
            return cls;
        },
        scope: scope
    };
}
function highlightTags(highlighters, tags) {
    let result = null;
    for (let highlighter of highlighters) {
        let value = highlighter.style(tags);
        if (value)
            result = result ? result + " " + value : value;
    }
    return result;
}
function highlightTree(tree, highlighter, putStyle, from = 0, to = tree.length) {
    let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
    builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters);
    builder.flush(to);
}
class HighlightBuilder {
    constructor(at, highlighters, span) {
        this.at = at;
        this.highlighters = highlighters;
        this.span = span;
        this.class = "";
    }
    startSpan(at, cls) {
        if (cls != this.class) {
            this.flush(at);
            if (at > this.at)
                this.at = at;
            this.class = cls;
        }
    }
    flush(to) {
        if (to > this.at && this.class)
            this.span(this.at, to, this.class);
    }
    highlightRange(cursor, from, to, inheritedClass, highlighters) {
        let { type, from: start, to: end } = cursor;
        if (start >= to || end <= from)
            return;
        if (type.isTop)
            highlighters = this.highlighters.filter(h => !h.scope || h.scope(type));
        let cls = inheritedClass;
        let rule = type.prop(ruleNodeProp), opaque = false;
        while (rule) {
            if (!rule.context || cursor.matchContext(rule.context)) {
                let tagCls = highlightTags(highlighters, rule.tags);
                if (tagCls) {
                    if (cls)
                        cls += " ";
                    cls += tagCls;
                    if (rule.mode == 1 /* Inherit */)
                        inheritedClass += (inheritedClass ? " " : "") + tagCls;
                    else if (rule.mode == 0 /* Opaque */)
                        opaque = true;
                }
                break;
            }
            rule = rule.next;
        }
        this.startSpan(cursor.from, cls);
        if (opaque)
            return;
        let mounted = cursor.tree && cursor.tree.prop(tree_NodeProp.mounted);
        if (mounted && mounted.overlay) {
            let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
            let innerHighlighters = this.highlighters.filter(h => !h.scope || h.scope(mounted.tree.type));
            let hasChild = cursor.firstChild();
            for (let i = 0, pos = start;; i++) {
                let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
                let nextPos = next ? next.from + start : end;
                let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to, nextPos);
                if (rangeFrom < rangeTo && hasChild) {
                    while (cursor.from < rangeTo) {
                        this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, highlighters);
                        this.startSpan(Math.min(to, cursor.to), cls);
                        if (cursor.to >= nextPos || !cursor.nextSibling())
                            break;
                    }
                }
                if (!next || nextPos > to)
                    break;
                pos = next.to + start;
                if (pos > from) {
                    this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos), inheritedClass, innerHighlighters);
                    this.startSpan(pos, cls);
                }
            }
            if (hasChild)
                cursor.parent();
        }
        else if (cursor.firstChild()) {
            do {
                if (cursor.to <= from)
                    continue;
                if (cursor.from >= to)
                    break;
                this.highlightRange(cursor, from, to, inheritedClass, highlighters);
                this.startSpan(Math.min(to, cursor.to), cls);
            } while (cursor.nextSibling());
            cursor.parent();
        }
    }
}
const t = Tag.define;
const comment = t(), highlight_name = t(), typeName = t(highlight_name), propertyName = t(highlight_name), literal = t(), string = t(literal), number = t(literal), content = t(), heading = t(content), keyword = t(), operator = t(), punctuation = t(), bracket = t(punctuation), meta = t();
const tags = {
    comment,
    lineComment: t(comment),
    blockComment: t(comment),
    docComment: t(comment),
    name: highlight_name,
    variableName: t(highlight_name),
    typeName: typeName,
    tagName: t(typeName),
    propertyName: propertyName,
    attributeName: t(propertyName),
    className: t(highlight_name),
    labelName: t(highlight_name),
    namespace: t(highlight_name),
    macroName: t(highlight_name),
    literal,
    string,
    docString: t(string),
    character: t(string),
    attributeValue: t(string),
    number,
    integer: t(number),
    float: t(number),
    bool: t(literal),
    regexp: t(literal),
    escape: t(literal),
    color: t(literal),
    url: t(literal),
    keyword,
    self: t(keyword),
    null: t(keyword),
    atom: t(keyword),
    unit: t(keyword),
    modifier: t(keyword),
    operatorKeyword: t(keyword),
    controlKeyword: t(keyword),
    definitionKeyword: t(keyword),
    moduleKeyword: t(keyword),
    operator,
    derefOperator: t(operator),
    arithmeticOperator: t(operator),
    logicOperator: t(operator),
    bitwiseOperator: t(operator),
    compareOperator: t(operator),
    updateOperator: t(operator),
    definitionOperator: t(operator),
    typeOperator: t(operator),
    controlOperator: t(operator),
    punctuation,
    separator: t(punctuation),
    bracket,
    angleBracket: t(bracket),
    squareBracket: t(bracket),
    paren: t(bracket),
    brace: t(bracket),
    content,
    heading,
    heading1: t(heading),
    heading2: t(heading),
    heading3: t(heading),
    heading4: t(heading),
    heading5: t(heading),
    heading6: t(heading),
    contentSeparator: t(content),
    list: t(content),
    quote: t(content),
    emphasis: t(content),
    strong: t(content),
    link: t(content),
    monospace: t(content),
    strikethrough: t(content),
    inserted: t(),
    deleted: t(),
    changed: t(),
    invalid: t(),
    meta,
    documentMeta: t(meta),
    annotation: t(meta),
    processingInstruction: t(meta),
    definition: Tag.defineModifier(),
    constant: Tag.defineModifier(),
    function: Tag.defineModifier(),
    standard: Tag.defineModifier(),
    local: Tag.defineModifier(),
    special: Tag.defineModifier()
};
const classHighlighter = tagHighlighter([
    { tag: tags.link, class: "tok-link" },
    { tag: tags.heading, class: "tok-heading" },
    { tag: tags.emphasis, class: "tok-emphasis" },
    { tag: tags.strong, class: "tok-strong" },
    { tag: tags.keyword, class: "tok-keyword" },
    { tag: tags.atom, class: "tok-atom" },
    { tag: tags.bool, class: "tok-bool" },
    { tag: tags.url, class: "tok-url" },
    { tag: tags.labelName, class: "tok-labelName" },
    { tag: tags.inserted, class: "tok-inserted" },
    { tag: tags.deleted, class: "tok-deleted" },
    { tag: tags.literal, class: "tok-literal" },
    { tag: tags.string, class: "tok-string" },
    { tag: tags.number, class: "tok-number" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
    { tag: tags.variableName, class: "tok-variableName" },
    { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
    { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
    { tag: tags.special(tags.variableName), class: "tok-variableName2" },
    { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
    { tag: tags.typeName, class: "tok-typeName" },
    { tag: tags.namespace, class: "tok-namespace" },
    { tag: tags.className, class: "tok-className" },
    { tag: tags.macroName, class: "tok-macroName" },
    { tag: tags.propertyName, class: "tok-propertyName" },
    { tag: tags.operator, class: "tok-operator" },
    { tag: tags.comment, class: "tok-comment" },
    { tag: tags.meta, class: "tok-meta" },
    { tag: tags.invalid, class: "tok-invalid" },
    { tag: tags.punctuation, class: "tok-punctuation" }
]);

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/highlight/index.js


// EXTERNAL MODULE: ./sys/public/js/editor/dist/utils/style-mod.js
var style_mod = __webpack_require__(245);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/highlight.js





/** A highlight style associates CSS styles with higlighting [tags](https://lezer.codemirror.net/docs/ref#highlight.Tag). */
class HighlightStyle {
    constructor(spec, options) {
        let modSpec;
        function def(spec) {
            let cls = style_mod/* StyleModule.newName */.V.newName();
            (modSpec || (modSpec = Object.create(null)))["." + cls] = spec;
            return cls;
        }
        const scopeOpt = options.scope;
        this.scope = scopeOpt instanceof Language ? (type) => type.prop(languageDataProp) == scopeOpt.data
            : scopeOpt ? (type) => type == scopeOpt : undefined;
        this.style = tagHighlighter(spec.map(style => ({
            tag: style.tag,
            class: style.class || def(Object.assign({}, style, { tag: null }))
        })), {
            all: typeof options.all == "string" ? options.all : options.all ? def(options.all) : undefined,
        }).style;
        this.module = modSpec ? new style_mod/* StyleModule */.V(modSpec) : null;
        this.themeType = options.themeType;
    }
    /**
     * Create a highlighter style that associates the given styles to
     * the given tags. The specs must be objects that hold a style tag
     * or array of tags in their `tag` property, and either a single
     * `class` property providing a static CSS class (for highlighter
     * that rely on external styling), or a
     * [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
     * set of CSS properties (which define the styling for those tags).
     * The CSS rules created for a highlighter will be emitted in the
     * order of the spec's properties. That means that for elements that
     * have multiple tags associated with them, styles defined further
     * down in the list will have a higher CSS precedence than styles
     * defined earlier.
     */
    static define(specs, options) {
        return new HighlightStyle(specs, options || {});
    }
}
const highlighterFacet = dist_state/* Facet.define */.r$.define();
const fallbackHighlighter = dist_state/* Facet.define */.r$.define({
    combine(values) { return values.length ? [values[0]] : null; }
});
function getHighlighters(state) {
    let main = state.facet(highlighterFacet);
    return main.length ? main : state.facet(fallbackHighlighter);
}
/**
 * Wrap a highlighter in an editor extension that uses it to apply syntax
 * highlighting to the editor content.
 *
 * When multiple (non-fallback) styles are provided, the styling applied is
 * the union of the classes they emit.
 */
function syntaxHighlighting(highlighter, options) {
    let ext = [treeHighlighter], themeType;
    if (highlighter instanceof HighlightStyle) {
        if (highlighter.module)
            ext.push(editorview/* EditorView.styleModule.of */.t.styleModule.of(highlighter.module));
        themeType = highlighter.themeType;
    }
    if (options === null || options === void 0 ? void 0 : options.fallback)
        ext.push(fallbackHighlighter.of(highlighter));
    else if (themeType)
        ext.push(highlighterFacet.computeN([editorview/* EditorView.darkTheme */.t.darkTheme], state => {
            return state.facet(editorview/* EditorView.darkTheme */.t.darkTheme) == (themeType == "dark") ? [highlighter] : [];
        }));
    else
        ext.push(highlighterFacet.of(highlighter));
    return ext;
}
/**
 * Returns the CSS classes (if any) that the highlighters active in the state would
 * assign to the given style [tags](https://lezer.codemirror.net/docs/ref#highlight.Tag)
 * and (optional) language [scope]{@link options.scope}.
 */
function highlightingFor(state, tags, scope) {
    let highlighters = getHighlighters(state);
    let result = null;
    if (highlighters)
        for (let highlighter of highlighters) {
            if (!highlighter.scope || scope && highlighter.scope(scope)) {
                let cls = highlighter.style(tags);
                if (cls)
                    result = result ? result + " " + cls : cls;
            }
        }
    return result;
}
class TreeHighlighter {
    constructor(view) {
        this.markCache = Object.create(null);
        this.tree = language_syntaxTree(view.state);
        this.decorations = this.buildDeco(view, getHighlighters(view.state));
    }
    update(update) {
        let tree = language_syntaxTree(update.state), highlighters = getHighlighters(update.state);
        let styleChange = highlighters != getHighlighters(update.startState);
        if (tree.length < update.view.viewport.to && !styleChange && tree.type == this.tree.type) {
            this.decorations = this.decorations.map(update.changes);
        }
        else if (tree != this.tree || update.viewportChanged || styleChange) {
            this.tree = tree;
            this.decorations = this.buildDeco(update.view, highlighters);
        }
    }
    buildDeco(view, highlighters) {
        if (!highlighters || !this.tree.length)
            return decoration/* Decoration.none */.p.none;
        let builder = new dist_state/* RangeSetBuilder */.f_();
        for (let { from, to } of view.visibleRanges) {
            highlightTree(this.tree, highlighters, (from, to, style) => {
                builder.add(from, to, this.markCache[style] || (this.markCache[style] = decoration/* Decoration.mark */.p.mark({ class: style })));
            }, from, to);
        }
        return builder.finish();
    }
}
const treeHighlighter = dist_state/* Prec.high */.Wl.high(extension/* ViewPlugin.fromClass */.lg.fromClass(TreeHighlighter, {
    decorations: v => v.decorations
}));
/** A default highlight style (works well with light themes). */
const defaultHighlightStyle = HighlightStyle.define([
    { tag: tags.meta,
        color: "#7a757a" },
    { tag: tags.link,
        textDecoration: "underline" },
    { tag: tags.heading,
        textDecoration: "underline",
        fontWeight: "bold" },
    { tag: tags.emphasis,
        fontStyle: "italic" },
    { tag: tags.strong,
        fontWeight: "bold" },
    { tag: tags.strikethrough,
        textDecoration: "line-through" },
    { tag: tags.keyword,
        color: "#708" },
    { tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
        color: "#219" },
    { tag: [tags.literal, tags.inserted],
        color: "#164" },
    { tag: [tags.string, tags.deleted],
        color: "#a11" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)],
        color: "#e40" },
    { tag: tags.definition(tags.variableName),
        color: "#00f" },
    { tag: tags.local(tags.variableName),
        color: "#30a" },
    { tag: [tags.typeName, tags.namespace],
        color: "#085" },
    { tag: tags.className,
        color: "#167" },
    { tag: [tags.special(tags.variableName), tags.macroName],
        color: "#256" },
    { tag: tags.definition(tags.propertyName),
        color: "#00c" },
    { tag: tags.comment,
        color: "#940" },
    { tag: tags.invalid,
        color: "#f00" }
]);

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/matchbrackets.js




const matchbrackets_baseTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
    "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
});
const DefaultScanDist = 10000, DefaultBrackets = "()[]{}";
const bracketMatchingConfig = dist_state/* Facet.define */.r$.define({
    combine(configs) {
        return (0,dist_state/* combineConfig */.BO)(configs, {
            afterCursor: true,
            brackets: DefaultBrackets,
            maxScanDistance: DefaultScanDist,
            renderMatch: defaultRenderMatch
        });
    }
});
const matchingMark = decoration/* Decoration.mark */.p.mark({ class: "cm-matchingBracket" }), nonmatchingMark = decoration/* Decoration.mark */.p.mark({ class: "cm-nonmatchingBracket" });
function defaultRenderMatch(match) {
    let decorations = [];
    let mark = match.matched ? matchingMark : nonmatchingMark;
    decorations.push(mark.range(match.start.from, match.start.to));
    if (match.end)
        decorations.push(mark.range(match.end.from, match.end.to));
    return decorations;
}
const bracketMatchingState = dist_state/* StateField.define */.QQ.define({
    create() { return decoration/* Decoration.none */.p.none; },
    update(deco, tr) {
        if (!tr.docChanged && !tr.selection)
            return deco;
        let decorations = [];
        let config = tr.state.facet(bracketMatchingConfig);
        for (let range of tr.state.selection.ranges) {
            if (!range.empty)
                continue;
            let match = matchBrackets(tr.state, range.head, -1, config)
                || (range.head > 0 && matchBrackets(tr.state, range.head - 1, 1, config))
                || (config.afterCursor &&
                    (matchBrackets(tr.state, range.head, 1, config) ||
                        (range.head < tr.state.doc.length && matchBrackets(tr.state, range.head + 1, -1, config))));
            if (match)
                decorations = decorations.concat(config.renderMatch(match, tr.state));
        }
        return decoration/* Decoration.set */.p.set(decorations, true);
    },
    provide: f => editorview/* EditorView.decorations.from */.t.decorations.from(f)
});
const bracketMatchingUnique = [
    bracketMatchingState,
    matchbrackets_baseTheme
];
/**
 * Create an extension that enables bracket matching. Whenever the cursor is next to a bracket,
 * that bracket and the one it matches are highlighted. Or, when no matching bracket is found,
 * another highlighting style is used to indicate this.
 */
function bracketMatching(config = {}) {
    return [bracketMatchingConfig.of(config), bracketMatchingUnique];
}
function matchingNodes(node, dir, brackets) {
    let byProp = node.prop(dir < 0 ? tree_NodeProp.openedBy : tree_NodeProp.closedBy);
    if (byProp)
        return byProp;
    if (node.name.length == 1) {
        let index = brackets.indexOf(node.name);
        if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
            return [brackets[index + dir]];
    }
    return null;
}
/**
 * Find the matching bracket for the token at `pos`, scanning direction `dir`. Only the
 * `brackets` and `maxScanDistance` properties are used from `config`, if given. Returns
 * null if no bracket was found at `pos`, or a match result otherwise.
 */
function matchBrackets(state, pos, dir, config = {}) {
    let maxScanDistance = config.maxScanDistance || DefaultScanDist, brackets = config.brackets || DefaultBrackets;
    let tree = language_syntaxTree(state), node = tree.resolveInner(pos, dir);
    for (let cur = node; cur; cur = cur.parent) {
        let matches = matchingNodes(cur.type, dir, brackets);
        if (matches && cur.from < cur.to)
            return matchMarkedBrackets(state, pos, dir, cur, matches, brackets);
    }
    return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
}
function matchMarkedBrackets(_state, _pos, dir, token, matching, brackets) {
    let parent = token.parent, firstToken = { from: token.from, to: token.to };
    let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor();
    if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
        do {
            if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
                if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
                    return { start: firstToken, end: { from: cursor.from, to: cursor.to }, matched: true };
                }
                else if (matchingNodes(cursor.type, dir, brackets)) {
                    depth++;
                }
                else if (matchingNodes(cursor.type, -dir, brackets)) {
                    depth--;
                    if (depth == 0)
                        return {
                            start: firstToken,
                            end: cursor.from == cursor.to ? undefined : { from: cursor.from, to: cursor.to },
                            matched: false
                        };
                }
            }
        } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
    return { start: firstToken, matched: false };
}
function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
    let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
    let bracket = brackets.indexOf(startCh);
    if (bracket < 0 || (bracket % 2 == 0) != (dir > 0))
        return null;
    let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
    let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
    for (let distance = 0; !(iter.next()).done && distance <= maxScanDistance;) {
        let text = iter.value;
        if (dir < 0)
            distance += text.length;
        let basePos = pos + distance * dir;
        for (let pos = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos != end; pos += dir) {
            let found = brackets.indexOf(text[pos]);
            if (found < 0 || tree.resolve(basePos + pos, 1).type != tokenType)
                continue;
            if ((found % 2 == 0) == (dir > 0)) {
                depth++;
            }
            else if (depth == 1) { // Closing
                return { start: startToken, end: { from: basePos + pos, to: basePos + pos + 1 }, matched: (found >> 1) == (bracket >> 1) };
            }
            else {
                depth--;
            }
        }
        if (dir > 0)
            distance += text.length;
    }
    return iter.done ? { start: startToken, matched: false } : null;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/stringstream.js
/** Counts the column offset in a string, taking tabs into account. Used mostly to find indentation. */
function countCol(string, end, tabSize, startIndex = 0, startValue = 0) {
    if (end == null) {
        end = string.search(/[^\s\u00a0]/);
        if (end == -1)
            end = string.length;
    }
    let n = startValue;
    for (let i = startIndex; i < end; i++) {
        if (string.charCodeAt(i) == 9)
            n += tabSize - (n % tabSize);
        else
            n++;
    }
    return n;
}
/** Encapsulates a single line of input. Given to stream syntax code, which uses it to tokenize the content. */
class StringStream {
    /** Create a stream. */
    constructor(
    /** The line. */
    string, tabSize, 
    /** The current indent unit size. */
    indentUnit) {
        this.string = string;
        this.tabSize = tabSize;
        this.indentUnit = indentUnit;
        /** The current position on the line. */
        this.pos = 0;
        /** The start position of the current token. */
        this.start = 0;
        this.lastColumnPos = 0;
        this.lastColumnValue = 0;
    }
    /** True if we are at the end of the line. */
    eol() { return this.pos >= this.string.length; }
    /** True if we are at the start of the line. */
    sol() { return this.pos == 0; }
    /** Get the next code unit after the current position, or undefined if we're at the end of the line. */
    peek() { return this.string.charAt(this.pos) || undefined; }
    /** Read the next code unit and advance `this.pos`. */
    next() {
        if (this.pos < this.string.length)
            return this.string.charAt(this.pos++);
    }
    /** Match the next character against the given string, regular expression, or predicate. Consume and return it if it matches. */
    eat(match) {
        let ch = this.string.charAt(this.pos);
        let ok;
        if (typeof match == "string")
            ok = ch == match;
        else
            ok = ch && (match instanceof RegExp ? match.test(ch) : match(ch));
        if (ok) {
            ++this.pos;
            return ch;
        }
    }
    /**
     * Continue matching characters that match the given string, regular expression, or
     * predicate function. Return true if any characters were consumed.
     */
    eatWhile(match) {
        let start = this.pos;
        while (this.eat(match)) { }
        return this.pos > start;
    }
    /** Consume whitespace ahead of `this.pos`. Return true if any was found. */
    eatSpace() {
        let start = this.pos;
        while (/[\s\u00a0]/.test(this.string.charAt(this.pos)))
            ++this.pos;
        return this.pos > start;
    }
    /** Move to the end of the line. */
    skipToEnd() { this.pos = this.string.length; }
    /** Move to directly before the given character, if found on the current line. */
    skipTo(ch) {
        let found = this.string.indexOf(ch, this.pos);
        if (found > -1) {
            this.pos = found;
            return true;
        }
    }
    /** Move back `n` characters. */
    backUp(n) { this.pos -= n; }
    /** Get the column position at `this.pos`. */
    column() {
        if (this.lastColumnPos < this.start) {
            this.lastColumnValue = countCol(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
            this.lastColumnPos = this.start;
        }
        return this.lastColumnValue;
    }
    /** Get the indentation column of the current line. */
    indentation() {
        return countCol(this.string, null, this.tabSize);
    }
    /**
     * Match the input against the given string or regular expression (which should start with a `^`).
     * Return true or the regexp match if it matches.
     *
     * Unless `consume` is set to `false`, this will move `this.pos` past the matched text.
     *
     * When matching a string `caseInsensitive` can be set to true to make the match case-insensitive.
     */
    match(pattern, consume, caseInsensitive) {
        if (typeof pattern == "string") {
            let cased = (str) => caseInsensitive ? str.toLowerCase() : str;
            let substr = this.string.substr(this.pos, pattern.length);
            if (cased(substr) == cased(pattern)) {
                if (consume !== false)
                    this.pos += pattern.length;
                return true;
            }
            else
                return null;
        }
        else {
            let match = this.string.slice(this.pos).match(pattern);
            if (match && match.index > 0)
                return null;
            if (match && consume !== false)
                this.pos += match[0].length;
            return match;
        }
    }
    /** Get the current token. */
    current() { return this.string.slice(this.start, this.pos); }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/stream-parser.js






function fullParser(spec) {
    return {
        token: spec.token,
        blankLine: spec.blankLine || (() => { }),
        startState: spec.startState || (() => true),
        copyState: spec.copyState || defaultCopyState,
        indent: spec.indent || (() => null),
        languageData: spec.languageData || {},
        tokenTable: spec.tokenTable || noTokens
    };
}
function defaultCopyState(state) {
    if (typeof state != "object")
        return state;
    let newState = {};
    for (let prop in state) {
        let val = state[prop];
        newState[prop] = (val instanceof Array ? val.slice() : val);
    }
    return newState;
}
/** A [language]{@link Language} class based on a CodeMirror 5-style [streaming parser](#language.StreamParser). */
class StreamLanguage extends Language {
    constructor(parser) {
        let data = defineLanguageFacet(parser.languageData);
        let p = fullParser(parser), self;
        let impl = new class extends Parser {
            createParse(input, fragments, ranges) {
                return new Parse(self, input, fragments, ranges);
            }
        };
        super(data, impl, [indentService.of((cx, pos) => this.getIndent(cx, pos))]);
        this.topNode = docID(data);
        self = this;
        this.streamParser = p;
        this.stateAfter = new tree_NodeProp({ perNode: true });
        this.tokenTable = parser.tokenTable ? new TokenTable(p.tokenTable) : defaultTokenTable;
    }
    /** Define a stream language. */
    static define(spec) { return new StreamLanguage(spec); }
    getIndent(cx, pos) {
        let tree = language_syntaxTree(cx.state), at = tree.resolve(pos);
        while (at && at.type != this.topNode)
            at = at.parent;
        if (!at)
            return null;
        let start = findState(this, tree, 0, at.from, pos), statePos, state;
        if (start) {
            state = start.state;
            statePos = start.pos + 1;
        }
        else {
            state = this.streamParser.startState(cx.unit);
            statePos = 0;
        }
        if (pos - statePos > 10000 /* MaxIndentScanDist */)
            return null;
        while (statePos < pos) {
            let line = cx.state.doc.lineAt(statePos), end = Math.min(pos, line.to);
            if (line.length) {
                let stream = new StringStream(line.text, cx.state.tabSize, cx.unit);
                while (stream.pos < end - line.from)
                    readToken(this.streamParser.token, stream, state);
            }
            else {
                this.streamParser.blankLine(state, cx.unit);
            }
            if (end == pos)
                break;
            statePos = line.to + 1;
        }
        let { text } = cx.lineAt(pos);
        return this.streamParser.indent(state, /^\s*(.*)/.exec(text)[1], cx);
    }
    get allowsNesting() { return false; }
}
function findState(lang, tree, off, startPos, before) {
    let state = off >= startPos && off + tree.length <= before && tree.prop(lang.stateAfter);
    if (state)
        return { state: lang.streamParser.copyState(state), pos: off + tree.length };
    for (let i = tree.children.length - 1; i >= 0; i--) {
        let child = tree.children[i], pos = off + tree.positions[i];
        let found = child instanceof tree_Tree && pos < before && findState(lang, child, pos, startPos, before);
        if (found)
            return found;
    }
    return null;
}
function cutTree(lang, tree, from, to, inside) {
    if (inside && from <= 0 && to >= tree.length)
        return tree;
    if (!inside && tree.type == lang.topNode)
        inside = true;
    for (let i = tree.children.length - 1; i >= 0; i--) {
        let pos = tree.positions[i], child = tree.children[i], inner;
        if (pos < to && child instanceof tree_Tree) {
            if (!(inner = cutTree(lang, child, from - pos, to - pos, inside)))
                break;
            return !inside ? inner
                : new tree_Tree(tree.type, tree.children.slice(0, i).concat(inner), tree.positions.slice(0, i + 1), pos + inner.length);
        }
    }
    return null;
}
function findStartInFragments(lang, fragments, startPos, editorState) {
    for (let f of fragments) {
        let from = f.from + (f.openStart ? 25 : 0), to = f.to - (f.openEnd ? 25 : 0);
        let found = from <= startPos && to > startPos && findState(lang, f.tree, 0 - f.offset, startPos, to), tree;
        if (found && (tree = cutTree(lang, f.tree, startPos + f.offset, found.pos + f.offset, false)))
            return { state: found.state, tree };
    }
    return { state: lang.streamParser.startState(editorState ? getIndentUnit(editorState) : 4), tree: tree_Tree.empty };
}
class Parse {
    constructor(lang, input, fragments, ranges) {
        this.lang = lang;
        this.input = input;
        this.fragments = fragments;
        this.ranges = ranges;
        this.stoppedAt = null;
        this.chunks = [];
        this.chunkPos = [];
        this.chunk = [];
        this.chunkReused = undefined;
        this.rangeIndex = 0;
        this.to = ranges[ranges.length - 1].to;
        let context = ParseContext.get(), from = ranges[0].from;
        let { state, tree } = findStartInFragments(lang, fragments, from, context === null || context === void 0 ? void 0 : context.state);
        this.state = state;
        this.parsedPos = this.chunkStart = from + tree.length;
        for (let i = 0; i < tree.children.length; i++) {
            this.chunks.push(tree.children[i]);
            this.chunkPos.push(tree.positions[i]);
        }
        if (context && this.parsedPos < context.viewport.from - 100000 /* MaxDistanceBeforeViewport */) {
            this.state = this.lang.streamParser.startState(getIndentUnit(context.state));
            context.skipUntilInView(this.parsedPos, context.viewport.from);
            this.parsedPos = context.viewport.from;
        }
        this.moveRangeIndex();
    }
    advance() {
        let context = ParseContext.get();
        let parseEnd = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt);
        let end = Math.min(parseEnd, this.chunkStart + 2048 /* ChunkSize */);
        if (context)
            end = Math.min(end, context.viewport.to);
        while (this.parsedPos < end)
            this.parseLine(context);
        if (this.chunkStart < this.parsedPos)
            this.finishChunk();
        if (this.parsedPos >= parseEnd)
            return this.finish();
        if (context && this.parsedPos >= context.viewport.to) {
            context.skipUntilInView(this.parsedPos, parseEnd);
            return this.finish();
        }
        return null;
    }
    stopAt(pos) {
        this.stoppedAt = pos;
    }
    lineAfter(pos) {
        let chunk = this.input.chunk(pos);
        if (!this.input.lineChunks) {
            let eol = chunk.indexOf("\n");
            if (eol > -1)
                chunk = chunk.slice(0, eol);
        }
        else if (chunk == "\n") {
            chunk = "";
        }
        return pos + chunk.length <= this.to ? chunk : chunk.slice(0, this.to - pos);
    }
    nextLine() {
        let from = this.parsedPos, line = this.lineAfter(from), end = from + line.length;
        for (let index = this.rangeIndex;;) {
            let rangeEnd = this.ranges[index].to;
            if (rangeEnd >= end)
                break;
            line = line.slice(0, rangeEnd - (end - line.length));
            index++;
            if (index == this.ranges.length)
                break;
            let rangeStart = this.ranges[index].from;
            let after = this.lineAfter(rangeStart);
            line += after;
            end = rangeStart + after.length;
        }
        return { line, end };
    }
    skipGapsTo(pos, offset, side) {
        for (;;) {
            let end = this.ranges[this.rangeIndex].to, offPos = pos + offset;
            if (side > 0 ? end > offPos : end >= offPos)
                break;
            let start = this.ranges[++this.rangeIndex].from;
            offset += start - end;
        }
        return offset;
    }
    moveRangeIndex() {
        while (this.ranges[this.rangeIndex].to < this.parsedPos)
            this.rangeIndex++;
    }
    emitToken(id, from, to, size, offset) {
        if (this.ranges.length > 1) {
            offset = this.skipGapsTo(from, offset, 1);
            from += offset;
            let len0 = this.chunk.length;
            offset = this.skipGapsTo(to, offset, -1);
            to += offset;
            size += this.chunk.length - len0;
        }
        this.chunk.push(id, from, to, size);
        return offset;
    }
    parseLine(context) {
        let { line, end } = this.nextLine(), offset = 0, { streamParser } = this.lang;
        let stream = new StringStream(line, context ? context.state.tabSize : 4, context ? getIndentUnit(context.state) : 2);
        if (stream.eol()) {
            streamParser.blankLine(this.state, stream.indentUnit);
        }
        else {
            while (!stream.eol()) {
                let token = readToken(streamParser.token, stream, this.state);
                if (token)
                    offset = this.emitToken(this.lang.tokenTable.resolve(token), this.parsedPos + stream.start, this.parsedPos + stream.pos, 4, offset);
                if (stream.start > 10000 /* MaxLineLength */)
                    break;
            }
        }
        this.parsedPos = end;
        this.moveRangeIndex();
        if (this.parsedPos < this.to)
            this.parsedPos++;
    }
    finishChunk() {
        let tree = tree_Tree.build({
            buffer: this.chunk,
            start: this.chunkStart,
            length: this.parsedPos - this.chunkStart,
            nodeSet,
            topID: 0,
            maxBufferLength: 2048 /* ChunkSize */,
            reused: this.chunkReused
        });
        tree = new tree_Tree(tree.type, tree.children, tree.positions, tree.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]);
        this.chunks.push(tree);
        this.chunkPos.push(this.chunkStart - this.ranges[0].from);
        this.chunk = [];
        this.chunkReused = undefined;
        this.chunkStart = this.parsedPos;
    }
    finish() {
        return new tree_Tree(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
    }
}
function readToken(token, stream, state) {
    stream.start = stream.pos;
    for (let i = 0; i < 10; i++) {
        let result = token(stream, state);
        if (stream.pos > stream.start)
            return result;
    }
    throw new Error("Stream parser failed to advance stream.");
}
const noTokens = Object.create(null);
const typeArray = [tree_NodeType.none];
const nodeSet = new NodeSet(typeArray);
const warned = [];
const defaultTable = Object.create(null);
for (let [legacyName, name] of [
    ["variable", "variableName"],
    ["variable-2", "variableName.special"],
    ["string-2", "string.special"],
    ["def", "variableName.definition"],
    ["tag", "typeName"],
    ["attribute", "propertyName"],
    ["type", "typeName"],
    ["builtin", "variableName.standard"],
    ["qualifier", "modifier"],
    ["error", "invalid"],
    ["header", "heading"],
    ["property", "propertyName"]
])
    defaultTable[legacyName] = createTokenType(noTokens, name);
class TokenTable {
    constructor(extra) {
        this.extra = extra;
        this.table = Object.assign(Object.create(null), defaultTable);
    }
    resolve(tag) {
        return !tag ? 0 : this.table[tag] || (this.table[tag] = createTokenType(this.extra, tag));
    }
}
const defaultTokenTable = new TokenTable(noTokens);
function warnForPart(part, msg) {
    if (warned.indexOf(part) > -1)
        return;
    warned.push(part);
    console.warn(msg);
}
function createTokenType(extra, tagStr) {
    let tag = null;
    for (let part of tagStr.split(".")) {
        let value = (extra[part] || tags[part]);
        if (!value) {
            warnForPart(part, `Unknown highlighting tag ${part}`);
        }
        else if (typeof value == "function") {
            if (!tag)
                warnForPart(part, `Modifier ${part} used at start of tag`);
            else
                tag = value(tag);
        }
        else {
            if (tag)
                warnForPart(part, `Tag ${part} used as modifier`);
            else
                tag = value;
        }
    }
    if (!tag)
        return 0;
    let name = tagStr.replace(/ /g, "_"), type = tree_NodeType.define({
        id: typeArray.length,
        name,
        props: [styleTags({ [name]: tag })]
    });
    typeArray.push(type);
    return type.id;
}
function docID(data) {
    let type = tree_NodeType.define({ id: typeArray.length, name: "Document", props: [languageDataProp.add(() => data)] });
    typeArray.push(type);
    return type;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/language/index.js








;// CONCATENATED MODULE: ./sys/public/js/editor/dist/commands/comment.js
/** Comment or uncomment the current selection. Will use line comments if available, otherwise falling back to block comments. */
const toggleComment = target => {
    let config = getConfig(target.state);
    return config.line ? toggleLineComment(target) : config.block ? toggleBlockCommentByLine(target) : false;
};
function command(f, option) {
    return ({ state, dispatch }) => {
        if (state.readOnly)
            return false;
        let tr = f(option, state);
        if (!tr)
            return false;
        dispatch(state.update(tr));
        return true;
    };
}
/** Comment or uncomment the current selection using line comments. The line comment syntax is taken from the {@link CommentTokens} [language data]{@link languageDataAt} */
const toggleLineComment = command(changeLineComment, 0 /* Toggle */);
/** Comment the current selection using line comments. */
const lineComment = command(changeLineComment, 1 /* Comment */);
/** Uncomment the current selection using line comments. */
const lineUncomment = command(changeLineComment, 2 /* Uncomment */);
/** Comment or uncomment the current selection using block comments. The block comment syntax is taken from the {@link CommentTokens} [language data]{@link languageDataAt} */
const toggleBlockComment = command(changeBlockComment, 0 /* Toggle */);
/** Comment the current selection using block comments. */
const blockComment = command(changeBlockComment, 1 /* Comment */);
/** Uncomment the current selection using block comments. */
const blockUncomment = command(changeBlockComment, 2 /* Uncomment */);
/** Comment or uncomment the lines around the current selection using block comments. */
const toggleBlockCommentByLine = command((o, s) => changeBlockComment(o, s, selectedLineRanges(s)), 0 /* Toggle */);
function getConfig(state, pos = state.selection.main.head) {
    let data = state.languageDataAt("commentTokens", pos);
    return data.length ? data[0] : {};
}
const SearchMargin = 50;
/** Determines if the given range is block-commented in the given state. */
function findBlockComment(state, { open, close }, from, to) {
    let textBefore = state.sliceDoc(from - SearchMargin, from);
    let textAfter = state.sliceDoc(to, to + SearchMargin);
    let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
    let beforeOff = textBefore.length - spaceBefore;
    if (textBefore.slice(beforeOff - open.length, beforeOff) == open &&
        textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
        return { open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
            close: { pos: to + spaceAfter, margin: spaceAfter && 1 } };
    }
    let startText, endText;
    if (to - from <= 2 * SearchMargin) {
        startText = endText = state.sliceDoc(from, to);
    }
    else {
        startText = state.sliceDoc(from, from + SearchMargin);
        endText = state.sliceDoc(to - SearchMargin, to);
    }
    let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
    let endOff = endText.length - endSpace - close.length;
    if (startText.slice(startSpace, startSpace + open.length) == open &&
        endText.slice(endOff, endOff + close.length) == close) {
        return { open: { pos: from + startSpace + open.length,
                margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0 },
            close: { pos: to - endSpace - close.length,
                margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0 } };
    }
    return null;
}
function selectedLineRanges(state) {
    let ranges = [];
    for (let r of state.selection.ranges) {
        let fromLine = state.doc.lineAt(r.from);
        let toLine = r.to <= fromLine.to ? fromLine : state.doc.lineAt(r.to);
        let last = ranges.length - 1;
        if (last >= 0 && ranges[last].to > fromLine.from)
            ranges[last].to = toLine.to;
        else
            ranges.push({ from: fromLine.from, to: toLine.to });
    }
    return ranges;
}
/** Performs toggle, comment and uncomment of block comments in languages that support them. */
function changeBlockComment(option, state, ranges = state.selection.ranges) {
    let tokens = ranges.map(r => getConfig(state, r.from).block);
    if (!tokens.every(c => c))
        return null;
    let comments = ranges.map((r, i) => findBlockComment(state, tokens[i], r.from, r.to));
    if (option != 2 /* Uncomment */ && !comments.every(c => c)) {
        return { changes: state.changes(ranges.map((range, i) => {
                if (comments[i])
                    return [];
                return [{ from: range.from, insert: tokens[i].open + " " }, { from: range.to, insert: " " + tokens[i].close }];
            })) };
    }
    else if (option != 1 /* Comment */ && comments.some(c => c)) {
        let changes = [];
        for (let i = 0, comment; i < comments.length; i++)
            if (comment = comments[i]) {
                let token = tokens[i], { open, close } = comment;
                changes.push({ from: open.pos - token.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token.close.length });
            }
        return { changes };
    }
    return null;
}
/** Performs toggle, comment and uncomment of line comments. */
function changeLineComment(option, state, ranges = state.selection.ranges) {
    let lines = [];
    let prevLine = -1;
    for (let { from, to } of ranges) {
        let startI = lines.length, minIndent = 1e9;
        for (let pos = from; pos <= to;) {
            let line = state.doc.lineAt(pos);
            if (line.from > prevLine && (from == to || to > line.from)) {
                prevLine = line.from;
                let token = getConfig(state, pos).line;
                if (!token)
                    continue;
                let indent = /^\s*/.exec(line.text)[0].length;
                let empty = indent == line.length;
                let comment = line.text.slice(indent, indent + token.length) == token ? indent : -1;
                if (indent < line.text.length && indent < minIndent)
                    minIndent = indent;
                lines.push({ line, comment, token, indent, empty, single: false });
            }
            pos = line.to + 1;
        }
        if (minIndent < 1e9)
            for (let i = startI; i < lines.length; i++)
                if (lines[i].indent < lines[i].line.text.length)
                    lines[i].indent = minIndent;
        if (lines.length == startI + 1)
            lines[startI].single = true;
    }
    if (option != 2 /* Uncomment */ && lines.some(l => l.comment < 0 && (!l.empty || l.single))) {
        let changes = [];
        for (let { line, token, indent, empty, single } of lines)
            if (single || !empty)
                changes.push({ from: line.from + indent, insert: token + " " });
        let changeSet = state.changes(changes);
        return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
    }
    else if (option != 1 /* Comment */ && lines.some(l => l.comment >= 0)) {
        let changes = [];
        for (let { line, comment, token } of lines)
            if (comment >= 0) {
                let from = line.from + comment, to = from + token.length;
                if (line.text[to - line.from] == " ")
                    to++;
                changes.push({ from, to });
            }
        return { changes };
    }
    return null;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/commands/history.js


const fromHistory = dist_state/* Annotation.define */.q6.define();
/**
 * Transaction annotation that will prevent that transaction from being combined with other transactions in
 * the undo history.
 *
 * With `"before"`, it'll prevent merging with previous transactions.
 * With `"after"`, subsequent transactions won't be combined with this one.
 * With `"full"`, the transaction is isolated on both sides.
 */
const isolateHistory = dist_state/* Annotation.define */.q6.define();
/**
 * This facet provides a way to register functions that, given a transaction, provide a set of effects that the
 * history should store when inverting the transaction. This can be used to integrate some kinds of effects in
 * the history, so that they can be undone (and redone again).
 */
const invertedEffects = dist_state/* Facet.define */.r$.define();
const historyConfig = dist_state/* Facet.define */.r$.define({
    combine(configs) {
        return (0,dist_state/* combineConfig */.BO)(configs, {
            minDepth: 100,
            newGroupDelay: 500
        }, { minDepth: Math.max, newGroupDelay: Math.min });
    }
});
function changeEnd(changes) {
    let end = 0;
    changes.iterChangedRanges((_, to) => end = to);
    return end;
}
const historyField_ = dist_state/* StateField.define */.QQ.define({
    create() {
        return HistoryState.empty;
    },
    update(state, tr) {
        let config = tr.state.facet(historyConfig);
        let fromHist = tr.annotation(fromHistory);
        if (fromHist) {
            let selection = tr.docChanged ? dist_state/* EditorSelection.single */.jT.single(changeEnd(tr.changes)) : undefined;
            let item = HistEvent.fromTransaction(tr, selection), from = fromHist.side;
            let other = from == 0 /* Done */ ? state.undone : state.done;
            if (item)
                other = updateBranch(other, other.length, config.minDepth, item);
            else
                other = addSelection(other, tr.startState.selection);
            return new HistoryState(from == 0 /* Done */ ? fromHist.rest : other, from == 0 /* Done */ ? other : fromHist.rest);
        }
        let isolate = tr.annotation(isolateHistory);
        if (isolate == "full" || isolate == "before")
            state = state.isolate();
        if (tr.annotation(dist_state/* Transaction.addToHistory */.YW.addToHistory) === false)
            return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
        let event = HistEvent.fromTransaction(tr);
        let time = tr.annotation(dist_state/* Transaction.time */.YW.time), userEvent = tr.annotation(dist_state/* Transaction.userEvent */.YW.userEvent);
        if (event)
            state = state.addChanges(event, time, userEvent, config.newGroupDelay, config.minDepth);
        else if (tr.selection)
            state = state.addSelection(tr.startState.selection, time, userEvent, config.newGroupDelay);
        if (isolate == "full" || isolate == "after")
            state = state.isolate();
        return state;
    },
    toJSON(value) {
        return { done: value.done.map(e => e.toJSON()), undone: value.undone.map(e => e.toJSON()) };
    },
    fromJSON(json) {
        return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
    }
});
/** Create a history extension with the given configuration. */
function history_history(config = {}) {
    return [
        historyField_,
        historyConfig.of(config),
        editorview/* EditorView.domEventHandlers */.t.domEventHandlers({
            beforeinput(e, view) {
                let command = e.inputType == "historyUndo" ? undo : e.inputType == "historyRedo" ? redo : null;
                if (!command)
                    return false;
                e.preventDefault();
                return command(view);
            }
        })
    ];
}
/**
 * The state field used to store the history data. Should probably only be used when you want to
 * [serialize]{@link EditorState.toJSON} or [deserialize]{@link EditorState.fromJSON} state objects in a way
 * that preserves history.
 */
const historyField = (/* unused pure expression or super */ null && (historyField_));
function cmd(side, selection) {
    return function ({ state, dispatch }) {
        if (!selection && state.readOnly)
            return false;
        let historyState = state.field(historyField_, false);
        if (!historyState)
            return false;
        let tr = historyState.pop(side, state, selection);
        if (!tr)
            return false;
        dispatch(tr);
        return true;
    };
}
/** Undo a single group of history events. Returns false if no group was available. */
const undo = cmd(0 /* Done */, false);
/** Redo a group of history events. Returns false if no group was available. */
const redo = cmd(1 /* Undone */, false);
/** Undo a change or selection change. */
const undoSelection = cmd(0 /* Done */, true);
/** Redo a change or selection change. */
const redoSelection = cmd(1 /* Undone */, true);
function depth(side) {
    return function (state) {
        let histState = state.field(historyField_, false);
        if (!histState)
            return 0;
        let branch = side == 0 /* Done */ ? histState.done : histState.undone;
        return branch.length - (branch.length && !branch[0].changes ? 1 : 0);
    };
}
/** The amount of undoable change events available in a given state. */
const undoDepth = depth(0 /* Done */);
/** The amount of redoable change events available in a given state. */
const redoDepth = depth(1 /* Undone */);
/** History events store groups of changes or effects that need to be undone/redone together. */
class HistEvent {
    constructor(
    // The changes in this event.
    changes, 
    // The effects associated with this event
    effects, mapped, 
    // The selection before this event
    startSelection, 
    // Stores selection changes after this event, to be used for selection undo/redo.
    selectionsAfter) {
        this.changes = changes;
        this.effects = effects;
        this.mapped = mapped;
        this.startSelection = startSelection;
        this.selectionsAfter = selectionsAfter;
    }
    setSelAfter(after) {
        return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
    }
    toJSON() {
        var _a, _b, _c;
        return {
            changes: (_a = this.changes) === null || _a === void 0 ? void 0 : _a.toJSON(),
            mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
            startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
            selectionsAfter: this.selectionsAfter.map(s => s.toJSON())
        };
    }
    static fromJSON(json) {
        return new HistEvent(json.changes && dist_state/* ChangeSet.fromJSON */.as.fromJSON(json.changes), [], json.mapped && dist_state/* ChangeDesc.fromJSON */.n0.fromJSON(json.mapped), json.startSelection && dist_state/* EditorSelection.fromJSON */.jT.fromJSON(json.startSelection), json.selectionsAfter.map(dist_state/* EditorSelection.fromJSON */.jT.fromJSON));
    }
    // This does not check `addToHistory` and such, it assumes the transaction needs to be converted to an item.
    // Returns null when there are no changes or effects in the transaction.
    static fromTransaction(tr, selection) {
        let effects = none;
        for (let invert of tr.startState.facet(invertedEffects)) {
            let result = invert(tr);
            if (result.length)
                effects = effects.concat(result);
        }
        if (!effects.length && tr.changes.empty)
            return null;
        return new HistEvent(tr.changes.invert(tr.startState.doc), effects, undefined, selection || tr.startState.selection, none);
    }
    static selection(selections) {
        return new HistEvent(undefined, none, undefined, undefined, selections);
    }
}
function updateBranch(branch, to, maxLen, newEvent) {
    let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
    let newBranch = branch.slice(start, to);
    newBranch.push(newEvent);
    return newBranch;
}
function isAdjacent(a, b) {
    let ranges = [], isAdjacent = false;
    a.iterChangedRanges((f, t) => ranges.push(f, t));
    b.iterChangedRanges((_f, _t, f, t) => {
        for (let i = 0; i < ranges.length;) {
            let from = ranges[i++], to = ranges[i++];
            if (t >= from && f <= to)
                isAdjacent = true;
        }
    });
    return isAdjacent;
}
function eqSelectionShape(a, b) {
    return a.ranges.length == b.ranges.length &&
        a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
}
function conc(a, b) {
    return !a.length ? b : !b.length ? a : a.concat(b);
}
const none = [];
const MaxSelectionsPerEvent = 200;
function addSelection(branch, selection) {
    if (!branch.length) {
        return [HistEvent.selection([selection])];
    }
    else {
        let lastEvent = branch[branch.length - 1];
        let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
        if (sels.length && sels[sels.length - 1].eq(selection))
            return branch;
        sels.push(selection);
        return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
    }
}
/** Assumes the top item has one or more selectionAfter values */
function popSelection(branch) {
    let last = branch[branch.length - 1];
    let newBranch = branch.slice();
    newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
    return newBranch;
}
/** Add a mapping to the top event in the given branch. If this maps away all the changes and effects in that item, drop it and propagate the mapping to the next item. */
function addMappingToBranch(branch, mapping) {
    if (!branch.length)
        return branch;
    let length = branch.length, selections = none;
    while (length) {
        let event = mapEvent(branch[length - 1], mapping, selections);
        if (event.changes && !event.changes.empty || event.effects.length) { // Event survived mapping
            let result = branch.slice(0, length);
            result[length - 1] = event;
            return result;
        }
        else { // Drop this event, since there's no changes or effects left
            mapping = event.mapped;
            length--;
            selections = event.selectionsAfter;
        }
    }
    return selections.length ? [HistEvent.selection(selections)] : none;
}
function mapEvent(event, mapping, extraSelections) {
    let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map(s => s.map(mapping)) : none, extraSelections);
    // Change-less events don't store mappings (they are always the last event in a branch)
    if (!event.changes)
        return HistEvent.selection(selections);
    let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
    let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
    return new HistEvent(mappedChanges, dist_state/* StateEffect.mapEffects */.Py.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
}
const joinableUserEvent = /^(input\.type|delete)($|\.)/;
class HistoryState {
    constructor(done, undone, prevTime = 0, prevUserEvent = undefined) {
        this.done = done;
        this.undone = undone;
        this.prevTime = prevTime;
        this.prevUserEvent = prevUserEvent;
    }
    isolate() {
        return this.prevTime ? new HistoryState(this.done, this.undone) : this;
    }
    addChanges(event, time, userEvent, newGroupDelay, maxLen) {
        let done = this.done, lastEvent = done[done.length - 1];
        if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes &&
            (!userEvent || joinableUserEvent.test(userEvent)) &&
            ((!lastEvent.selectionsAfter.length &&
                time - this.prevTime < newGroupDelay &&
                isAdjacent(lastEvent.changes, event.changes)) ||
                // For compose (but not compose.start) events, always join with previous event
                userEvent == "input.type.compose")) {
            done = updateBranch(done, done.length - 1, maxLen, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none));
        }
        else {
            done = updateBranch(done, done.length, maxLen, event);
        }
        return new HistoryState(done, none, time, userEvent);
    }
    addSelection(selection, time, userEvent, newGroupDelay) {
        let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none;
        if (last.length > 0 &&
            time - this.prevTime < newGroupDelay &&
            userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) &&
            eqSelectionShape(last[last.length - 1], selection))
            return this;
        return new HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
    }
    addMapping(mapping) {
        return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
    }
    pop(side, state, selection) {
        let branch = side == 0 /* Done */ ? this.done : this.undone;
        if (branch.length == 0)
            return null;
        let event = branch[branch.length - 1];
        if (selection && event.selectionsAfter.length) {
            return state.update({
                selection: event.selectionsAfter[event.selectionsAfter.length - 1],
                annotations: fromHistory.of({ side, rest: popSelection(branch) }),
                userEvent: side == 0 /* Done */ ? "select.undo" : "select.redo",
                scrollIntoView: true
            });
        }
        else if (!event.changes) {
            return null;
        }
        else {
            let rest = branch.length == 1 ? none : branch.slice(0, branch.length - 1);
            if (event.mapped)
                rest = addMappingToBranch(rest, event.mapped);
            return state.update({
                changes: event.changes,
                selection: event.startSelection,
                effects: event.effects,
                annotations: fromHistory.of({ side, rest }),
                filter: false,
                userEvent: side == 0 /* Done */ ? "undo" : "redo",
                scrollIntoView: true
            });
        }
    }
}
HistoryState.empty = new HistoryState(none, none);
/**
 * Default key bindings for the undo history.
 *
 *  - Mod-z: {@link undo}.
 *  - Mod-y (Mod-Shift-z on macOS): {@link redo}.
 *  - Mod-u: {@link undoSelection}.
 *  - Alt-u (Mod-Shift-u on macOS): {@link redoSelection}.
 */
const historyKeymap = [
    { key: "Mod-z", run: undo, preventDefault: true },
    { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
    { key: "Mod-u", run: undoSelection, preventDefault: true },
    { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
];

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/commands/commands.js





function updateSel(sel, by) {
    return dist_state/* EditorSelection.create */.jT.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection) {
    return state.update({ selection, scrollIntoView: true, userEvent: "select" });
}
function moveSel({ state, dispatch }, how) {
    let selection = updateSel(state.selection, how);
    if (selection.eq(state.selection))
        return false;
    dispatch(setSel(state, selection));
    return true;
}
function rangeEnd(range, forward) {
    return dist_state/* EditorSelection.cursor */.jT.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
    return moveSel(view, range => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
function ltrAtCursor(view) {
    return view.textDirectionAt(view.state.selection.main.head) == view_bidi/* Direction.LTR */.Nm.LTR;
}
/** Move the selection one character to the left (which is backward in left-to-right text, forward in right-to-left text). */
const cursorCharLeft = view => cursorByChar(view, !ltrAtCursor(view));
/** Move the selection one character to the right. */
const cursorCharRight = view => cursorByChar(view, ltrAtCursor(view));
/** Move the selection one character forward. */
const cursorCharForward = view => cursorByChar(view, true);
/** Move the selection one character backward. */
const cursorCharBackward = view => cursorByChar(view, false);
function cursorByGroup(view, forward) {
    return moveSel(view, range => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
/** Move the selection to the left across one group of word or non-word (but also non-space) characters. */
const cursorGroupLeft = view => cursorByGroup(view, !ltrAtCursor(view));
/** Move the selection one group to the right. */
const cursorGroupRight = view => cursorByGroup(view, ltrAtCursor(view));
/** Move the selection one group forward. */
const cursorGroupForward = view => cursorByGroup(view, true);
/** Move the selection one group backward. */
const cursorGroupBackward = view => cursorByGroup(view, false);
function moveBySubword(view, range, forward) {
    let categorize = view.state.charCategorizer(range.from);
    return view.moveByChar(range, forward, start => {
        let cat = CharCategory.Space, pos = range.from;
        let done = false, sawUpper = false, sawLower = false;
        let step = (next) => {
            if (done)
                return false;
            pos += forward ? next.length : -next.length;
            let nextCat = categorize(next), ahead;
            if (cat == CharCategory.Space)
                cat = nextCat;
            if (cat != nextCat)
                return false;
            if (cat == CharCategory.Word) {
                if (next.toLowerCase() == next) {
                    if (!forward && sawUpper)
                        return false;
                    sawLower = true;
                }
                else if (sawLower) {
                    if (forward)
                        return false;
                    done = true;
                }
                else {
                    if (sawUpper && forward && categorize(ahead = view.state.sliceDoc(pos, pos + 1)) == CharCategory.Word &&
                        ahead.toLowerCase() == ahead)
                        return false;
                    sawUpper = true;
                }
            }
            return true;
        };
        step(start);
        return step;
    });
}
function cursorBySubword(view, forward) {
    return moveSel(view, range => range.empty ? moveBySubword(view, range, forward) : rangeEnd(range, forward));
}
/** Move the selection one group or camel-case subword forward. */
const cursorSubwordForward = view => cursorBySubword(view, true);
/** Move the selection one group or camel-case subword backward. */
const cursorSubwordBackward = view => cursorBySubword(view, false);
function interestingNode(state, node, bracketProp) {
    if (node.type.prop(bracketProp))
        return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
    let pos = language_syntaxTree(state).resolveInner(start.head);
    let bracketProp = forward ? tree_NodeProp.closedBy : tree_NodeProp.openedBy;
    // Scan forward through child nodes to see if there's an interesting node ahead.
    for (let at = start.head;;) {
        let next = forward ? pos.childAfter(at) : pos.childBefore(at);
        if (!next)
            break;
        if (interestingNode(state, next, bracketProp))
            pos = next;
        else
            at = forward ? next.to : next.from;
    }
    let bracket = pos.type.prop(bracketProp), match, newPos;
    if (bracket && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
        newPos = forward ? match.end.to : match.end.from;
    else
        newPos = forward ? pos.to : pos.from;
    return dist_state/* EditorSelection.cursor */.jT.cursor(newPos, forward ? -1 : 1);
}
/** Move the cursor over the next syntactic element to the left. */
const cursorSyntaxLeft = view => moveSel(view, range => moveBySyntax(view.state, range, !ltrAtCursor(view)));
/** Move the cursor over the next syntactic element to the right. */
const cursorSyntaxRight = view => moveSel(view, range => moveBySyntax(view.state, range, ltrAtCursor(view)));
function cursorByLine(view, forward) {
    return moveSel(view, range => {
        if (!range.empty)
            return rangeEnd(range, forward);
        let moved = view.moveVertically(range, forward);
        return moved.head != range.head ? moved : view.moveToLineBoundary(range, forward);
    });
}
/** Move the selection one line up. */
const cursorLineUp = view => cursorByLine(view, false);
/** Move the selection one line down. */
const cursorLineDown = view => cursorByLine(view, true);
function pageHeight(view) {
    return Math.max(view.defaultLineHeight, Math.min(view.dom.clientHeight, innerHeight) - 5);
}
function cursorByPage(view, forward) {
    let { state } = view, selection = updateSel(state.selection, range => {
        return range.empty ? view.moveVertically(range, forward, pageHeight(view)) : rangeEnd(range, forward);
    });
    if (selection.eq(state.selection))
        return false;
    let startPos = view.coordsAtPos(state.selection.main.head);
    let scrollRect = view.scrollDOM.getBoundingClientRect();
    let effect;
    if (startPos && startPos.top > scrollRect.top && startPos.bottom < scrollRect.bottom &&
        startPos.top - scrollRect.top <= view.scrollDOM.scrollHeight - view.scrollDOM.scrollTop - view.scrollDOM.clientHeight)
        effect = editorview/* EditorView.scrollIntoView */.t.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollRect.top });
    view.dispatch(setSel(state, selection), { effects: effect });
    return true;
}
/** Move the selection one page up. */
const cursorPageUp = view => cursorByPage(view, false);
/** Move the selection one page down. */
const cursorPageDown = view => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
    let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
        moved = view.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
        let space = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
        if (space && start.head != line.from + space)
            moved = dist_state/* EditorSelection.cursor */.jT.cursor(line.from + space);
    }
    return moved;
}
/** Move the selection to the next line wrap point, or to the end of the line if there isn't one left on this line. */
const cursorLineBoundaryForward = view => moveSel(view, range => moveByLineBoundary(view, range, true));
/** Move the selection to previous line wrap point, or failing that to the start of the line. */
const cursorLineBoundaryBackward = view => moveSel(view, range => moveByLineBoundary(view, range, false));
/** Move the selection to the start of the line. */
const cursorLineStart = view => moveSel(view, range => dist_state/* EditorSelection.cursor */.jT.cursor(view.lineBlockAt(range.head).from, 1));
/** Move the selection to the end of the line. */
const cursorLineEnd = view => moveSel(view, range => dist_state/* EditorSelection.cursor */.jT.cursor(view.lineBlockAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend) {
    let found = false, selection = updateSel(state.selection, range => {
        let matching = matchBrackets(state, range.head, -1)
            || matchBrackets(state, range.head, 1)
            || (range.head > 0 && matchBrackets(state, range.head - 1, 1))
            || (range.head < state.doc.length && matchBrackets(state, range.head + 1, -1));
        if (!matching || !matching.end)
            return range;
        found = true;
        let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
        return extend ? dist_state/* EditorSelection.range */.jT.range(range.anchor, head) : dist_state/* EditorSelection.cursor */.jT.cursor(head);
    });
    if (!found)
        return false;
    dispatch(setSel(state, selection));
    return true;
}
/** Move the selection to the bracket matching the one it is currently on, if any. */
const cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
/** Extend the selection to the bracket matching the one the selection head is currently on, if any. */
const selectMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, true);
function extendSel(view, how) {
    let selection = updateSel(view.state.selection, range => {
        let head = how(range);
        return dist_state/* EditorSelection.range */.jT.range(range.anchor, head.head, head.goalColumn);
    });
    if (selection.eq(view.state.selection))
        return false;
    view.dispatch(setSel(view.state, selection));
    return true;
}
function selectByChar(view, forward) {
    return extendSel(view, range => view.moveByChar(range, forward));
}
/** Move the selection head one character to the left, while leaving the anchor in place. */
const selectCharLeft = view => selectByChar(view, !ltrAtCursor(view));
/** Move the selection head one character to the right. */
const selectCharRight = view => selectByChar(view, ltrAtCursor(view));
/** Move the selection head one character forward. */
const selectCharForward = view => selectByChar(view, true);
/** Move the selection head one character backward. */
const selectCharBackward = view => selectByChar(view, false);
function selectByGroup(view, forward) {
    return extendSel(view, range => view.moveByGroup(range, forward));
}
/** Move the selection head one [group](#commands.cursorGroupLeft) to the left. */
const selectGroupLeft = view => selectByGroup(view, !ltrAtCursor(view));
/** Move the selection head one group to the right. */
const selectGroupRight = view => selectByGroup(view, ltrAtCursor(view));
/** Move the selection head one group forward. */
const selectGroupForward = view => selectByGroup(view, true);
/** Move the selection head one group backward. */
const selectGroupBackward = view => selectByGroup(view, false);
function selectBySubword(view, forward) {
    return extendSel(view, range => moveBySubword(view, range, forward));
}
/** Move the selection head one group or camel-case subword forward. */
const selectSubwordForward = view => selectBySubword(view, true);
/** Move the selection head one group or subword backward. */
const selectSubwordBackward = view => selectBySubword(view, false);
/** Move the selection head over the next syntactic element to the left. */
const selectSyntaxLeft = view => extendSel(view, range => moveBySyntax(view.state, range, !ltrAtCursor(view)));
/** Move the selection head over the next syntactic element to the right. */
const selectSyntaxRight = view => extendSel(view, range => moveBySyntax(view.state, range, ltrAtCursor(view)));
function selectByLine(view, forward) {
    return extendSel(view, range => view.moveVertically(range, forward));
}
/** Move the selection head one line up. */
const selectLineUp = view => selectByLine(view, false);
/** Move the selection head one line down. */
const selectLineDown = view => selectByLine(view, true);
function selectByPage(view, forward) {
    return extendSel(view, range => view.moveVertically(range, forward, pageHeight(view)));
}
/** Move the selection head one page up. */
const selectPageUp = view => selectByPage(view, false);
/** Move the selection head one page down. */
const selectPageDown = view => selectByPage(view, true);
/** Move the selection head to the next line boundary. */
const selectLineBoundaryForward = view => extendSel(view, range => moveByLineBoundary(view, range, true));
/** Move the selection head to the previous line boundary. */
const selectLineBoundaryBackward = view => extendSel(view, range => moveByLineBoundary(view, range, false));
/** Move the selection head to the start of the line. */
const selectLineStart = view => extendSel(view, range => dist_state/* EditorSelection.cursor */.jT.cursor(view.lineBlockAt(range.head).from));
/** Move the selection head to the end of the line. */
const selectLineEnd = view => extendSel(view, range => dist_state/* EditorSelection.cursor */.jT.cursor(view.lineBlockAt(range.head).to));
/** Move the selection to the start of the document. */
const cursorDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: 0 }));
    return true;
};
/** Move the selection to the end of the document. */
const cursorDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.doc.length }));
    return true;
};
/** Move the selection head to the start of the document. */
const selectDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
    return true;
};
/** Move the selection head to the end of the document. */
const selectDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
    return true;
};
/** Select the entire document. */
const selectAll = ({ state, dispatch }) => {
    dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
    return true;
};
/** Expand the selection to cover entire lines. */
const selectLine = ({ state, dispatch }) => {
    let ranges = selectedLineBlocks(state).map(({ from, to }) => dist_state/* EditorSelection.range */.jT.range(from, Math.min(to + 1, state.doc.length)));
    dispatch(state.update({ selection: dist_state/* EditorSelection.create */.jT.create(ranges), userEvent: "select" }));
    return true;
};
/** Select the next syntactic construct that is larger than the selection. */
const selectParentSyntax = ({ state, dispatch }) => {
    let selection = updateSel(state.selection, range => {
        var _a;
        let context = language_syntaxTree(state).resolveInner(range.head, 1);
        while (!((context.from < range.from && context.to >= range.to) ||
            (context.to > range.to && context.from <= range.from) ||
            !((_a = context.parent) === null || _a === void 0 ? void 0 : _a.parent)))
            context = context.parent;
        return dist_state/* EditorSelection.range */.jT.range(context.to, context.from);
    });
    dispatch(setSel(state, selection));
    return true;
};
/** Simplify the current selection. */
const simplifySelection = ({ state, dispatch }) => {
    let cur = state.selection, selection = null;
    if (cur.ranges.length > 1)
        selection = dist_state/* EditorSelection.create */.jT.create([cur.main]);
    else if (!cur.main.empty)
        selection = dist_state/* EditorSelection.create */.jT.create([dist_state/* EditorSelection.cursor */.jT.cursor(cur.main.head)]);
    if (!selection)
        return false;
    dispatch(setSel(state, selection));
    return true;
};
function deleteBy({ state, dispatch }, by) {
    if (state.readOnly)
        return false;
    let event = "delete.selection";
    let changes = state.changeByRange(range => {
        let { from, to } = range;
        if (from == to) {
            let towards = by(from);
            if (towards < from)
                event = "delete.backward";
            else if (towards > from)
                event = "delete.forward";
            from = Math.min(from, towards);
            to = Math.max(to, towards);
        }
        return from == to ? { range } : { changes: { from, to }, range: dist_state/* EditorSelection.cursor */.jT.cursor(from) };
    });
    if (changes.changes.empty)
        return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: event }));
    return true;
}
function skipAtomic(target, pos, forward) {
    if (target instanceof editorview/* EditorView */.t)
        for (let ranges of target.state.facet(editorview/* EditorView.atomicRanges */.t.atomicRanges).map(f => f(target)))
            ranges.between(pos, pos, (from, to) => {
                if (from < pos && to > pos)
                    pos = forward ? to : from;
            });
    return pos;
}
const deleteByChar = (target, forward) => deleteBy(target, pos => {
    let { state } = target, line = state.doc.lineAt(pos), before, targetPos;
    if (!forward && pos > line.from && pos < line.from + 200 &&
        !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
        if (before[before.length - 1] == "\t")
            return pos - 1;
        let col = (0,dist_state/* countColumn */.IS)(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
        for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
            pos--;
        targetPos = pos;
    }
    else {
        targetPos = (0,dist_state/* findClusterBreak */.cp)(line.text, pos - line.from, forward, forward) + line.from;
        if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
            targetPos += forward ? 1 : -1;
    }
    return skipAtomic(target, targetPos, forward);
});
/** Delete the selection, or, for cursor selections, the character before the cursor. */
const deleteCharBackward = view => deleteByChar(view, false);
/** Delete the selection or the character after the cursor. */
const deleteCharForward = view => deleteByChar(view, true);
const deleteByGroup = (target, forward) => deleteBy(target, start => {
    let pos = start, { state } = target, line = state.doc.lineAt(pos);
    let categorize = state.charCategorizer(pos);
    for (let cat = null;;) {
        if (pos == (forward ? line.to : line.from)) {
            if (pos == start && line.number != (forward ? state.doc.lines : 1))
                pos += forward ? 1 : -1;
            break;
        }
        let next = (0,dist_state/* findClusterBreak */.cp)(line.text, pos - line.from, forward) + line.from;
        let nextChar = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
        let nextCat = categorize(nextChar);
        if (cat != null && nextCat != cat)
            break;
        if (nextChar != " " || pos != start)
            cat = nextCat;
        pos = next;
    }
    return skipAtomic(target, pos, forward);
});
/** Delete the selection or backward until the end of the next [group]{@link moveByGroup}, only skipping groups of whitespace when they consist of a single space. */
const deleteGroupBackward = target => deleteByGroup(target, false);
/** Delete the selection or forward until the end of the next group. */
const deleteGroupForward = target => deleteByGroup(target, true);
/**
 * Delete the selection, or, if it is a cursor selection, delete to the end of the line.
 * If the cursor is directly at the end of the line, delete the line break after it.
 */
const deleteToLineEnd = view => deleteBy(view, pos => {
    let lineEnd = view.lineBlockAt(pos).to;
    return skipAtomic(view, pos < lineEnd ? lineEnd : Math.min(view.state.doc.length, pos + 1), true);
});
/**
 * Delete the selection, or, if it is a cursor selection, delete to the start of the line.
 * If the cursor is directly at the start of the line, delete the line break before it.
 * @param view
 */
const deleteToLineStart = view => deleteBy(view, pos => {
    let lineStart = view.lineBlockAt(pos).from;
    return skipAtomic(view, pos > lineStart ? lineStart : Math.max(0, pos - 1), false);
});
/** Delete all whitespace directly before a line end from the document. */
const deleteTrailingWhitespace = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = [];
    for (let pos = 0, prev = "", iter = state.doc.iter();;) {
        iter.next();
        if (iter.lineBreak || iter.done) {
            let trailing = prev.search(/\s+$/);
            if (trailing > -1)
                changes.push({ from: pos - (prev.length - trailing), to: pos });
            if (iter.done)
                break;
            prev = "";
        }
        else {
            prev = iter.value;
        }
        pos += iter.value.length;
    }
    if (!changes.length)
        return false;
    dispatch(state.update({ changes, userEvent: "delete" }));
    return true;
};
/** Replace each selection range with a line break, leaving the cursor on the line before the break. */
const splitLine = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = state.changeByRange(range => {
        return { changes: { from: range.from, to: range.to, insert: dist_state/* Text.of */.xv.of(["", ""]) },
            range: dist_state/* EditorSelection.cursor */.jT.cursor(range.from) };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
};
/** Flip the characters before and after the cursor(s). */
const transposeChars = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = state.changeByRange(range => {
        if (!range.empty || range.from == 0 || range.from == state.doc.length)
            return { range };
        let pos = range.from, line = state.doc.lineAt(pos);
        let from = pos == line.from ? pos - 1 : (0,dist_state/* findClusterBreak */.cp)(line.text, pos - line.from, false) + line.from;
        let to = pos == line.to ? pos + 1 : (0,dist_state/* findClusterBreak */.cp)(line.text, pos - line.from, true) + line.from;
        return { changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
            range: dist_state/* EditorSelection.cursor */.jT.cursor(to) };
    });
    if (changes.changes.empty)
        return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
    return true;
};
function selectedLineBlocks(state) {
    let blocks = [], upto = -1;
    for (let range of state.selection.ranges) {
        let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
        if (!range.empty && range.to == endLine.from)
            endLine = state.doc.lineAt(range.to - 1);
        if (upto >= startLine.number) {
            let prev = blocks[blocks.length - 1];
            prev.to = endLine.to;
            prev.ranges.push(range);
        }
        else {
            blocks.push({ from: startLine.from, to: endLine.to, ranges: [range] });
        }
        upto = endLine.number + 1;
    }
    return blocks;
}
function moveLine(state, dispatch, forward) {
    if (state.readOnly)
        return false;
    let changes = [], ranges = [];
    for (let block of selectedLineBlocks(state)) {
        if (forward ? block.to == state.doc.length : block.from == 0)
            continue;
        let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
        let size = nextLine.length + 1;
        if (forward) {
            changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
            for (let r of block.ranges)
                ranges.push(dist_state/* EditorSelection.range */.jT.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
        }
        else {
            changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
            for (let r of block.ranges)
                ranges.push(dist_state/* EditorSelection.range */.jT.range(r.anchor - size, r.head - size));
        }
    }
    if (!changes.length)
        return false;
    dispatch(state.update({
        changes,
        scrollIntoView: true,
        selection: dist_state/* EditorSelection.create */.jT.create(ranges, state.selection.mainIndex),
        userEvent: "move.line"
    }));
    return true;
}
/** Move the selected lines up one line. */
const moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
/** Move the selected lines down one line. */
const moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
    if (state.readOnly)
        return false;
    let changes = [];
    for (let block of selectedLineBlocks(state)) {
        if (forward)
            changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
        else
            changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
    }
    dispatch(state.update({ changes, scrollIntoView: true, userEvent: "input.copyline" }));
    return true;
}
/** Create a copy of the selected lines. Keep the selection in the top copy. */
const copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
/** Create a copy of the selected lines. Keep the selection in the bottom copy. */
const copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
/** Delete selected lines. */
const deleteLine = view => {
    if (view.state.readOnly)
        return false;
    let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
        if (from > 0)
            from--;
        else if (to < state.doc.length)
            to++;
        return { from, to };
    }));
    let selection = updateSel(state.selection, range => view.moveVertically(range, true)).map(changes);
    view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
    return true;
};
/** Replace the selection with a newline. */
const insertNewline = ({ state, dispatch }) => {
    dispatch(state.update(state.replaceSelection(state.lineBreak), { scrollIntoView: true, userEvent: "input" }));
    return true;
};
function isBetweenBrackets(state, pos) {
    if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
        return { from: pos, to: pos };
    let context = language_syntaxTree(state).resolveInner(pos);
    let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos &&
        (closedBy = before.type.prop(tree_NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 &&
        state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from)
        return { from: before.to, to: after.from };
    return null;
}
/** Replace the selection with a newline and indent the newly created line(s). */
const insertNewlineAndIndent = newlineAndIndent(false);
/** Create a blank, indented line below the current line. */
const insertBlankLine = newlineAndIndent(true);
function newlineAndIndent(atEof) {
    return ({ state, dispatch }) => {
        if (state.readOnly)
            return false;
        let changes = state.changeByRange(range => {
            let { from, to } = range, line = state.doc.lineAt(from);
            let explode = !atEof && from == to && isBetweenBrackets(state, from);
            if (atEof)
                from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
            let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
            let indent = getIndentation(cx, from);
            if (indent == null)
                indent = /^\s*/.exec(state.doc.lineAt(from).text)[0].length;
            while (to < line.to && /\s/.test(line.text[to - line.from]))
                to++;
            if (explode)
                ({ from, to } = explode);
            else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
                from = line.from;
            let insert = ["", indentString(state, indent)];
            if (explode)
                insert.push(indentString(state, cx.lineIndent(line.from, -1)));
            return { changes: { from, to, insert: dist_state/* Text.of */.xv.of(insert) },
                range: dist_state/* EditorSelection.cursor */.jT.cursor(from + 1 + insert[1].length) };
        });
        dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
        return true;
    };
}
function changeBySelectedLine(state, f) {
    let atLine = -1;
    return state.changeByRange(range => {
        let changes = [];
        for (let pos = range.from; pos <= range.to;) {
            let line = state.doc.lineAt(pos);
            if (line.number > atLine && (range.empty || range.to > line.from)) {
                f(line, changes, range);
                atLine = line.number;
            }
            pos = line.to + 1;
        }
        let changeSet = state.changes(changes);
        return { changes,
            range: dist_state/* EditorSelection.range */.jT.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1)) };
    });
}
/** Auto-indent the selected lines. This uses the [indentation service facet]{@link indentService} as source for auto-indent information. */
const indentSelection = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let updated = Object.create(null);
    let context = new IndentContext(state, { overrideIndentation: start => {
            let found = updated[start];
            return found == null ? -1 : found;
        } });
    let changes = changeBySelectedLine(state, (line, changes, range) => {
        let indent = getIndentation(context, line.from);
        if (indent == null)
            return;
        if (!/\S/.test(line.text))
            indent = 0;
        let cur = /^\s*/.exec(line.text)[0];
        let norm = indentString(state, indent);
        if (cur != norm || range.from < line.from + cur.length) {
            updated[line.from] = indent;
            changes.push({ from: line.from, to: line.from + cur.length, insert: norm });
        }
    });
    if (!changes.changes.empty)
        dispatch(state.update(changes, { userEvent: "indent" }));
    return true;
};
/** Add a [unit]{@link indentUnit} of indentation to all selected lines. */
const indentMore = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
        changes.push({ from: line.from, insert: state.facet(indentUnit) });
    }), { userEvent: "input.indent" }));
    return true;
};
/** Remove a [unit]{@link indentUnit} of indentation from all selected lines. */
const indentLess = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
        let space = /^\s*/.exec(line.text)[0];
        if (!space)
            return;
        let col = (0,dist_state/* countColumn */.IS)(space, state.tabSize), keep = 0;
        let insert = indentString(state, Math.max(0, col - getIndentUnit(state)));
        while (keep < space.length && keep < insert.length && space.charCodeAt(keep) == insert.charCodeAt(keep))
            keep++;
        changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert.slice(keep) });
    }), { userEvent: "delete.dedent" }));
    return true;
};
/** Insert a tab character at the cursor or, if something is selected, use {@link indentMore} to indent the entire selection. */
const insertTab = ({ state, dispatch }) => {
    if (state.selection.ranges.some(r => !r.empty))
        return indentMore({ state, dispatch });
    dispatch(state.update(state.replaceSelection("\t"), { scrollIntoView: true, userEvent: "input" }));
    return true;
};
/**
 * Array of key bindings containing the Emacs-style bindings that are
 * available on macOS by default.
 *
 *  - Ctrl-b: {@link cursorCharLeft} ({@link selectCharLeft} with Shift)
 *  - Ctrl-f: {@link cursorCharRight} ({@link selectCharRight} with Shift)
 *  - Ctrl-p: {@link cursorLineUp} ({@link selectLineUp} with Shift)
 *  - Ctrl-n: {@link cursorLineDown} ({@link selectLineDown} with Shift)
 *  - Ctrl-a: {@link cursorLineStart} ({@link selectLineStart} with Shift)
 *  - Ctrl-e: {@link cursorLineEnd} ({@link selectLineEnd} with Shift)
 *  - Ctrl-d: {@link deleteCharForward}.
 *  - Ctrl-h: {@link deleteCharBackward}.
 *  - Ctrl-k: {@link deleteToLineEnd}.
 *  - Ctrl-Alt-h: {@link deleteGroupBackward}
 *  - Ctrl-o: {@link splitLine}
 *  - Ctrl-t: {@link transposeChars}
 *  - Ctrl-v: {@link cursorPageDown}
 *  - Alt-v: {@link cursorPageUp}
 */
const emacsStyleKeymap = [
    { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
    { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
    { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
    { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
    { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
    { key: "Ctrl-d", run: deleteCharForward },
    { key: "Ctrl-h", run: deleteCharBackward },
    { key: "Ctrl-k", run: deleteToLineEnd },
    { key: "Ctrl-Alt-h", run: deleteGroupBackward },
    { key: "Ctrl-o", run: splitLine },
    { key: "Ctrl-t", run: transposeChars },
    { key: "Ctrl-v", run: cursorPageDown },
];
/**
 * An array of key bindings closely sticking to platform-standard or widely used bindings. (This includes the bindings from
 * {@link emacsStyleKeymap}, with their `key` property changed to `mac`.)
 *
 *  - ArrowLeft: {@link cursorCharLeft} ({@link selectCharLeft} with Shift)
 *  - ArrowRight: {@link cursorCharRight} ({@link selectCharRight} with Shift)
 *  - Ctrl-ArrowLeft (Alt-ArrowLeft on macOS): {@link cursorGroupLeft} ({@link selectGroupLeft} with Shift)
 *  - Ctrl-ArrowRight (Alt-ArrowRight on macOS): {@link cursorGroupRight} ({@link selectGroupRight} with Shift)
 *  - Cmd-ArrowLeft (on macOS): {@link cursorLineStart} ({@link selectLineStart} with Shift)
 *  - Cmd-ArrowRight (on macOS): {@link cursorLineEnd} ({@link selectLineEnd} with Shift)
 *  - ArrowUp: {@link cursorLineUp} ({@link selectLineUp} with Shift)
 *  - ArrowDown: {@link cursorLineDown} ({@link selectLineDown} with Shift)
 *  - Cmd-ArrowUp (on macOS): {@link cursorDocStart} ({@link selectDocStart} with Shift)
 *  - Cmd-ArrowDown (on macOS): {@link cursorDocEnd} ({@link selectDocEnd} with Shift)
 *  - Ctrl-ArrowUp (on macOS): {@link cursorPageUp} ({@link selectPageUp} with Shift)
 *  - Ctrl-ArrowDown (on macOS): {@link cursorPageDown} ({@link selectPageDown} with Shift)
 *  - PageUp: {@link cursorPageUp} ({@link selectPageUp} with Shift)
 *  - PageDown: {@link cursorPageDown} ({@link selectPageDown} with Shift)
 *  - Home: {@link cursorLineBoundaryBackward} ({@link selectLineBoundaryBackward} with Shift)
 *  - End: {@link cursorLineBoundaryForward} ({@link selectLineBoundaryForward} with Shift)
 *  - Ctrl-Home (Cmd-Home on macOS): {@link cursorDocStart} ({@link selectDocStart} with Shift)
 *  - Ctrl-End (Cmd-Home on macOS): {@link cursorDocEnd}) ({@link selectDocEnd} with Shift)
 *  - Enter: {@link insertNewlineAndIndent}
 *  - Ctrl-a (Cmd-a on macOS): {@link selectAll}
 *  - Backspace: {@link deleteCharBackward}
 *  - Delete: {@link deleteCharForward}
 *  - Ctrl-Backspace (Alt-Backspace on macOS): {@link deleteGroupBackward}
 *  - Ctrl-Delete (Alt-Delete on macOS): {@link deleteGroupForward}
 *  - Cmd-Backspace (macOS): {@link deleteToLineStart}.
 *  - Cmd-Delete (macOS): {@link deleteToLineEnd}.
 */
const standardKeymap = [
    { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft },
    { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward },
    { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
    { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight },
    { mac: "Cmd-ArrowRight", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward },
    { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
    { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
    { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
    { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
    { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
    { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
    { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
    { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
    { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
    { key: "Enter", run: insertNewlineAndIndent },
    { key: "Mod-a", run: selectAll },
    { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
    { key: "Delete", run: deleteCharForward },
    { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
    { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
    { mac: "Mod-Backspace", run: deleteToLineStart },
    { mac: "Mod-Delete", run: deleteToLineEnd }
].concat(emacsStyleKeymap.map(b => ({ mac: b.key, run: b.run, shift: b.shift })));
/**
 * The default keymap. Includes all bindings from {@link standardKeymap} plus the following:
 *
 *  - Alt-ArrowLeft (Ctrl-ArrowLeft on macOS): {@link cursorSyntaxLeft} ({@link selectSyntaxLeft} with Shift)
 *  - Alt-ArrowRight (Ctrl-ArrowRight on macOS): {@link cursorSyntaxRight} ({@link selectSyntaxRight} with Shift)
 *  - Alt-ArrowUp: {@link moveLineUp}.
 *  - Alt-ArrowDown: {@link moveLineDown}.
 *  - Shift-Alt-ArrowUp: {@link copyLineUp}.
 *  - Shift-Alt-ArrowDown: {@link copyLineDown}.
 *  - Escape: {@link simplifySelection}.
 *  - Ctrl-Enter (Comd-Enter on macOS): {@link insertBlankLine}.
 *  - Alt-l (Ctrl-l on macOS): {@link selectLine}.
 *  - Ctrl-i (Cmd-i on macOS): {@link selectParentSyntax}.
 *  - Ctrl-[ (Cmd-[ on macOS): {@link indentLess}.
 *  - Ctrl-] (Cmd-] on macOS): {@link indentMore}.
 *  - Ctrl-Alt-\\ (Cmd-Alt-\\ on macOS): {@link indentSelection}.
 *  - Shift-Ctrl-k (Shift-Cmd-k on macOS): {@link deleteLine}.
 *  - Shift-Ctrl-\\ (Shift-Cmd-\\ on macOS): {@link cursorMatchingBracket}.
 *  - Ctrl-/ (Cmd-/ on macOS): {@link toggleComment}.
 *  - Shift-Alt-a: {@link toggleBlockComment}.
 */
const defaultKeymap = [
    { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
    { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
    { key: "Alt-ArrowUp", run: moveLineUp },
    { key: "Shift-Alt-ArrowUp", run: copyLineUp },
    { key: "Alt-ArrowDown", run: moveLineDown },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown },
    { key: "Escape", run: simplifySelection },
    { key: "Mod-Enter", run: insertBlankLine },
    { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
    { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
    { key: "Mod-[", run: indentLess },
    { key: "Mod-]", run: indentMore },
    { key: "Mod-Alt-\\", run: indentSelection },
    { key: "Shift-Mod-k", run: deleteLine },
    { key: "Shift-Mod-\\", run: cursorMatchingBracket },
    { key: "Mod-/", run: toggleComment },
    { key: "Alt-A", run: toggleBlockComment }
].concat(standardKeymap);
/** A binding that binds Tab to {@link indentMore} and Shift-Tab to {@link indentLess}. */
const indentWithTab = { key: "Tab", run: indentMore, shift: indentLess };

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/commands/index.js




;// CONCATENATED MODULE: ./sys/public/js/editor/dist/search/cursor.js

const basicNormalize = typeof String.prototype.normalize == "function"
    ? x => x.normalize("NFKD") : x => x;
/** A search cursor provides an iterator over text matches in a document. */
class SearchCursor {
    /**
     * Create a text cursor. The query is the search string, `from` to `to` provides the region to search.
     *
     * When `normalize` is given, it will be called, on both the query string and the content it is matched against, before comparing.
     * You can, for example, create a case-insensitive search by passing `s => s.toLowerCase()`.
     *
     * Text is always normalized with [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) (when supported).
     */
    constructor(text, query, from = 0, to = text.length, normalize) {
        /** The current match (only holds a meaningful value after [`next`]{@link SearchCursor.next} has been called and when `done` is false). */
        this.value = { from: 0, to: 0 };
        /** Whether the end of the iterated region has been reached. */
        this.done = false;
        this.matches = [];
        this.buffer = "";
        this.bufferPos = 0;
        this.iter = text.iterRange(from, to);
        this.bufferStart = from;
        this.normalize = normalize ? x => normalize(basicNormalize(x)) : basicNormalize;
        this.query = this.normalize(query);
    }
    peek() {
        if (this.bufferPos == this.buffer.length) {
            this.bufferStart += this.buffer.length;
            this.iter.next();
            if (this.iter.done)
                return -1;
            this.bufferPos = 0;
            this.buffer = this.iter.value;
        }
        return (0,dist_state/* codePointAt */.gm)(this.buffer, this.bufferPos);
    }
    /**
     * Look for the next match. Updates the iterator's [`value`]{@link SearchCursor.value} and [`done`]{@link SearchCursor.done}
     * properties. Should be called at least once before using the cursor.
     */
    next() {
        while (this.matches.length)
            this.matches.pop();
        return this.nextOverlapping();
    }
    /** The `next` method will ignore matches that partially overlap a previous match. This method behaves like `next`, but includes such matches. */
    nextOverlapping() {
        for (;;) {
            let next = this.peek();
            if (next < 0) {
                this.done = true;
                return this;
            }
            let str = (0,dist_state/* fromCodePoint */.bg)(next), start = this.bufferStart + this.bufferPos;
            this.bufferPos += (0,dist_state/* codePointSize */.nZ)(next);
            let norm = this.normalize(str);
            for (let i = 0, pos = start;; i++) {
                let code = norm.charCodeAt(i);
                let match = this.match(code, pos);
                if (match) {
                    this.value = match;
                    return this;
                }
                if (i == norm.length - 1)
                    break;
                if (pos == start && i < str.length && str.charCodeAt(i) == code)
                    pos++;
            }
        }
    }
    match(code, pos) {
        let match = null;
        for (let i = 0; i < this.matches.length; i += 2) {
            let index = this.matches[i], keep = false;
            if (this.query.charCodeAt(index) == code) {
                if (index == this.query.length - 1) {
                    match = { from: this.matches[i + 1], to: pos + 1 };
                }
                else {
                    this.matches[i]++;
                    keep = true;
                }
            }
            if (!keep) {
                this.matches.splice(i, 2);
                i -= 2;
            }
        }
        if (this.query.charCodeAt(0) == code) {
            if (this.query.length == 1)
                match = { from: pos, to: pos + 1 };
            else
                this.matches.push(1, pos);
        }
        return match;
    }
}
Symbol.iterator;
if (typeof Symbol != "undefined")
    SearchCursor.prototype[Symbol.iterator] = function () { return this; };

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/search/selection-match.js



const defaultHighlightOptions = {
    highlightWordAroundCursor: false,
    minSelectionLength: 1,
    maxMatches: 100,
    wholeWords: false
};
const highlightConfig = dist_state/* Facet.define */.r$.define({
    combine(options) {
        return (0,dist_state/* combineConfig */.BO)(options, defaultHighlightOptions, {
            highlightWordAroundCursor: (a, b) => a || b,
            minSelectionLength: Math.min,
            maxMatches: Math.min
        });
    }
});
/**
 * This extension highlights text that matches the selection. It uses the `"cm-selectionMatch"` class for the highlighting.
 * When `highlightWordAroundCursor` is enabled, the word at the cursor itself will be highlighted with `"cm-selectionMatch-main"`.
 */
function highlightSelectionMatches(options) {
    let ext = [defaultTheme, matchHighlighter];
    if (options)
        ext.push(highlightConfig.of(options));
    return ext;
}
const matchDeco = decoration/* Decoration.mark */.p.mark({ class: "cm-selectionMatch" });
const mainMatchDeco = decoration/* Decoration.mark */.p.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
// Whether the characters directly outside the given positions are non-word characters
function insideWordBoundaries(check, state, from, to) {
    return (from == 0 || check(state.sliceDoc(from - 1, from)) != dist_state/* CharCategory.Word */.D0.Word) &&
        (to == state.doc.length || check(state.sliceDoc(to, to + 1)) != dist_state/* CharCategory.Word */.D0.Word);
}
// Whether the characters directly at the given positions are word characters
function insideWord(check, state, from, to) {
    return check(state.sliceDoc(from, from + 1)) == dist_state/* CharCategory.Word */.D0.Word
        && check(state.sliceDoc(to - 1, to)) == dist_state/* CharCategory.Word */.D0.Word;
}
const matchHighlighter = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.decorations = this.getDeco(view);
    }
    update(update) {
        if (update.selectionSet || update.docChanged || update.viewportChanged)
            this.decorations = this.getDeco(update.view);
    }
    getDeco(view) {
        let conf = view.state.facet(highlightConfig);
        let { state } = view, sel = state.selection;
        if (sel.ranges.length > 1)
            return decoration/* Decoration.none */.p.none;
        let range = sel.main, query, check = null;
        if (range.empty) {
            if (!conf.highlightWordAroundCursor)
                return decoration/* Decoration.none */.p.none;
            let word = state.wordAt(range.head);
            if (!word)
                return decoration/* Decoration.none */.p.none;
            check = state.charCategorizer(range.head);
            query = state.sliceDoc(word.from, word.to);
        }
        else {
            let len = range.to - range.from;
            if (len < conf.minSelectionLength || len > 200)
                return decoration/* Decoration.none */.p.none;
            if (conf.wholeWords) {
                query = state.sliceDoc(range.from, range.to); // TODO: allow and include leading/trailing space?
                check = state.charCategorizer(range.head);
                if (!(insideWordBoundaries(check, state, range.from, range.to)
                    && insideWord(check, state, range.from, range.to)))
                    return decoration/* Decoration.none */.p.none;
            }
            else {
                query = state.sliceDoc(range.from, range.to).trim();
                if (!query)
                    return decoration/* Decoration.none */.p.none;
            }
        }
        let deco = [];
        for (let part of view.visibleRanges) {
            let cursor = new SearchCursor(state.doc, query, part.from, part.to);
            while (!cursor.next().done) {
                let { from, to } = cursor.value;
                if (!check || insideWordBoundaries(check, state, from, to)) {
                    if (range.empty && from <= range.from && to >= range.to)
                        deco.push(mainMatchDeco.range(from, to));
                    else if (from >= range.to || to <= range.from)
                        deco.push(matchDeco.range(from, to));
                    if (deco.length > conf.maxMatches)
                        return decoration/* Decoration.none */.p.none;
                }
            }
        }
        return decoration/* Decoration.set */.p.set(deco);
    }
}, {
    decorations: v => v.decorations
});
const defaultTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
    ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
});
// Select the words around the cursors.
const selectWord = ({ state, dispatch }) => {
    let { selection } = state;
    let newSel = dist_state/* EditorSelection.create */.jT.create(selection.ranges.map(range => state.wordAt(range.head) || dist_state/* EditorSelection.cursor */.jT.cursor(range.head)), selection.mainIndex);
    if (newSel.eq(selection))
        return false;
    dispatch(state.update({ selection: newSel }));
    return true;
};
// Find next occurrence of query relative to last cursor. Wrap around
// the document if there are no more matches.
function findNextOccurrence(state, query) {
    let { main, ranges } = state.selection;
    let word = state.wordAt(main.head), fullWord = word && word.from == main.from && word.to == main.to;
    for (let cycled = false, cursor = new SearchCursor(state.doc, query, ranges[ranges.length - 1].to);;) {
        cursor.next();
        if (cursor.done) {
            if (cycled)
                return null;
            cursor = new SearchCursor(state.doc, query, 0, Math.max(0, ranges[ranges.length - 1].from - 1));
            cycled = true;
        }
        else {
            if (cycled && ranges.some(r => r.from == cursor.value.from))
                continue;
            if (fullWord) {
                let word = state.wordAt(cursor.value.from);
                if (!word || word.from != cursor.value.from || word.to != cursor.value.to)
                    continue;
            }
            return cursor.value;
        }
    }
}
/** Select next occurrence of the current selection. Expand selection to the surrounding word when the selection is empty. */
const selectNextOccurrence = ({ state, dispatch }) => {
    let { ranges } = state.selection;
    if (ranges.some(sel => sel.from === sel.to))
        return selectWord({ state, dispatch });
    let searchedText = state.sliceDoc(ranges[0].from, ranges[0].to);
    if (state.selection.ranges.some(r => state.sliceDoc(r.from, r.to) != searchedText))
        return false;
    let range = findNextOccurrence(state, searchedText);
    if (!range)
        return false;
    dispatch(state.update({
        selection: state.selection.addRange(dist_state/* EditorSelection.range */.jT.range(range.from, range.to), false),
        effects: editorview/* EditorView.scrollIntoView */.t.scrollIntoView(range.to)
    }));
    return true;
};

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/search/regexp.js
const empty = { from: -1, to: -1, match: /.*/.exec("") };
const baseFlags = "gm" + (/x/.unicode == null ? "" : "u");
/** This class is similar to {@link SearchCursor} but searches for a regular expression pattern instead of a plain string. */
class RegExpCursor {
    /** Create a cursor that will search the given range in the given document. */
    constructor(text, query, options, from = 0, to = text.length) {
        this.to = to;
        this.curLine = "";
        /** Set to `true` when the cursor has reached the end of the search range. */
        this.done = false;
        /** Will contain an object with the extent of the match and the match object when {@link next} sucessfully finds a match. */
        this.value = empty;
        if (/\\[sWDnr]|\n|\r|\[\^/.test(query))
            return new MultilineRegExpCursor(text, query, options, from, to);
        this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
        this.iter = text.iter();
        let startLine = text.lineAt(from);
        this.curLineStart = startLine.from;
        this.matchPos = from;
        this.getLine(this.curLineStart);
    }
    getLine(skip) {
        this.iter.next(skip);
        if (this.iter.lineBreak) {
            this.curLine = "";
        }
        else {
            this.curLine = this.iter.value;
            if (this.curLineStart + this.curLine.length > this.to)
                this.curLine = this.curLine.slice(0, this.to - this.curLineStart);
            this.iter.next();
        }
    }
    nextLine() {
        this.curLineStart = this.curLineStart + this.curLine.length + 1;
        if (this.curLineStart > this.to)
            this.curLine = "";
        else
            this.getLine(0);
    }
    /** Move to the next match, if there is one. */
    next() {
        for (let off = this.matchPos - this.curLineStart;;) {
            this.re.lastIndex = off;
            let match = this.matchPos <= this.to && this.re.exec(this.curLine);
            if (match) {
                let from = this.curLineStart + match.index, to = from + match[0].length;
                this.matchPos = to + (from == to ? 1 : 0);
                if (from == this.curLine.length)
                    this.nextLine();
                if (from < to || from > this.value.to) {
                    this.value = { from, to, match };
                    return this;
                }
                off = this.matchPos - this.curLineStart;
            }
            else if (this.curLineStart + this.curLine.length < this.to) {
                this.nextLine();
                off = 0;
            }
            else {
                this.done = true;
                return this;
            }
        }
    }
}
Symbol.iterator;
const flattened = new WeakMap();
/** Reusable (partially) flattened document strings */
class FlattenedDoc {
    constructor(from, text) {
        this.from = from;
        this.text = text;
    }
    get to() { return this.from + this.text.length; }
    static get(doc, from, to) {
        let cached = flattened.get(doc);
        if (!cached || cached.from >= to || cached.to <= from) {
            let flat = new FlattenedDoc(from, doc.sliceString(from, to));
            flattened.set(doc, flat);
            return flat;
        }
        if (cached.from == from && cached.to == to)
            return cached;
        let { text, from: cachedFrom } = cached;
        if (cachedFrom > from) {
            text = doc.sliceString(from, cachedFrom) + text;
            cachedFrom = from;
        }
        if (cached.to < to)
            text += doc.sliceString(cached.to, to);
        flattened.set(doc, new FlattenedDoc(cachedFrom, text));
        return new FlattenedDoc(from, text.slice(from - cachedFrom, to - cachedFrom));
    }
}
class MultilineRegExpCursor {
    constructor(text, query, options, from, to) {
        this.text = text;
        this.to = to;
        this.done = false;
        this.value = empty;
        this.matchPos = from;
        this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
        this.flat = FlattenedDoc.get(text, from, this.chunkEnd(from + 5000 /* Base */));
    }
    chunkEnd(pos) {
        return pos >= this.to ? this.to : this.text.lineAt(pos).to;
    }
    next() {
        for (;;) {
            let off = this.re.lastIndex = this.matchPos - this.flat.from;
            let match = this.re.exec(this.flat.text);
            // Skip empty matches directly after the last match
            if (match && !match[0] && match.index == off) {
                this.re.lastIndex = off + 1;
                match = this.re.exec(this.flat.text);
            }
            // If a match goes almost to the end of a noncomplete chunk, try
            // again, since it'll likely be able to match more
            if (match && this.flat.to < this.to && match.index + match[0].length > this.flat.text.length - 10)
                match = null;
            if (match) {
                let from = this.flat.from + match.index, to = from + match[0].length;
                this.value = { from, to, match };
                this.matchPos = to + (from == to ? 1 : 0);
                return this;
            }
            else {
                if (this.flat.to == this.to) {
                    this.done = true;
                    return this;
                }
                // Grow the flattened doc
                this.flat = FlattenedDoc.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
            }
        }
    }
}
Symbol.iterator;
if (typeof Symbol != "undefined") {
    RegExpCursor.prototype[Symbol.iterator] = MultilineRegExpCursor.prototype[Symbol.iterator] =
        function () { return this; };
}
function validRegExp(source) {
    try {
        new RegExp(source, baseFlags);
        return true;
    }
    catch (_a) {
        return false;
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/utils/crelt.js
function crelt() {
    let elt = arguments[0];
    if (typeof elt == "string")
        elt = document.createElement(elt);
    let i = 1, next = arguments[1];
    if (next && typeof next == "object" && next.nodeType == null && !Array.isArray(next)) {
        for (let name in next)
            if (Object.prototype.hasOwnProperty.call(next, name)) {
                const value = next[name];
                if (typeof value == "string")
                    elt.setAttribute(name, value);
                else if (value != null)
                    elt[name] = value;
            }
        i++;
    }
    for (; i < arguments.length; i++)
        add(elt, arguments[i]);
    return elt;
}
function add(elt, child) {
    if (typeof child == "string") {
        elt.appendChild(document.createTextNode(child));
    }
    else if (child == null) {
    }
    else if (child.nodeType != null) {
        elt.appendChild(child);
    }
    else if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++)
            add(elt, child[i]);
    }
    else {
        throw new RangeError("Unsupported child node: " + child);
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/search/goto-line.js



function createLineDialog(view) {
    let input = crelt("input", { class: "cm-textfield", name: "line" });
    let dom = crelt("form", {
        class: "cm-gotoLine",
        onkeydown: (event) => {
            if (event.keyCode == 27) { // Escape
                event.preventDefault();
                view.dispatch({ effects: dialogEffect.of(false) });
                view.focus();
            }
            else if (event.keyCode == 13) { // Enter
                event.preventDefault();
                go();
            }
        },
        onsubmit: (event) => {
            event.preventDefault();
            go();
        }
    }, crelt("label", view.state.phrase("Go to line"), ": ", input), " ", crelt("button", { class: "cm-button", type: "submit" }, view.state.phrase("go")));
    function go() {
        let match = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(input.value);
        if (!match)
            return;
        let { state } = view, startLine = state.doc.lineAt(state.selection.main.head);
        let [, sign, ln, cl, percent] = match;
        let col = cl ? +cl.slice(1) : 0;
        let line = ln ? +ln : startLine.number;
        if (ln && percent) {
            let pc = line / 100;
            if (sign)
                pc = pc * (sign == "-" ? -1 : 1) + (startLine.number / state.doc.lines);
            line = Math.round(state.doc.lines * pc);
        }
        else if (ln && sign) {
            line = line * (sign == "-" ? -1 : 1) + startLine.number;
        }
        let docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, line)));
        view.dispatch({
            effects: dialogEffect.of(false),
            selection: dist_state/* EditorSelection.cursor */.jT.cursor(docLine.from + Math.max(0, Math.min(col, docLine.length))),
            scrollIntoView: true
        });
        view.focus();
    }
    return { dom };
}
const dialogEffect = dist_state/* StateEffect.define */.Py.define();
const dialogField = dist_state/* StateField.define */.QQ.define({
    create() { return true; },
    update(value, tr) {
        for (let e of tr.effects)
            if (e.is(dialogEffect))
                value = e.value;
        return value;
    },
    provide: f => view_panel/* showPanel.from */.mH.from(f, val => val ? createLineDialog : null)
});
/**
 * Command that shows a dialog asking the user for a line number, and when a valid position is provided, moves the cursor to that line.
 *
 * Supports line numbers, relative line offsets prefixed with `+` or `-`, document percentages suffixed with `%`, and an optional
 * column position by adding `:` and a second number after the line number.
 *
 * The dialog can be styled with the `panel.gotoLine` theme selector.
 */
const gotoLine = view => {
    let panel = (0,view_panel/* getPanel */.Sd)(view, createLineDialog);
    if (!panel) {
        let effects = [dialogEffect.of(true)];
        if (view.state.field(dialogField, false) == null)
            effects.push(dist_state/* StateEffect.appendConfig.of */.Py.appendConfig.of([dialogField, goto_line_baseTheme]));
        view.dispatch({ effects });
        panel = (0,view_panel/* getPanel */.Sd)(view, createLineDialog);
    }
    if (panel)
        panel.dom.querySelector("input").focus();
    return true;
};
const goto_line_baseTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-panel.cm-gotoLine": {
        padding: "2px 6px 4px",
        "& label": { fontSize: "80%" }
    }
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/search/search.js







const searchConfigFacet = dist_state/* Facet.define */.r$.define({
    combine(configs) {
        var _a;
        return {
            top: configs.reduce((val, conf) => val !== null && val !== void 0 ? val : conf.top, undefined) || false,
            caseSensitive: configs.reduce((val, conf) => val !== null && val !== void 0 ? val : conf.caseSensitive, undefined) || false,
            createPanel: ((_a = configs.find(c => c.createPanel)) === null || _a === void 0 ? void 0 : _a.createPanel) || (view => new SearchPanel(view))
        };
    }
});
/**
 * Add search state to the editor configuration, and optionally configure the search extension.
 * ({@link openSearchPanel} will automatically enable this if it isn't already on).
 */
function search(config) {
    return config ? [searchConfigFacet.of(config), searchExtensions] : searchExtensions;
}
/** A search query. Part of the editor's search state. */
class SearchQuery {
    /**
     * Create a query object.
     * @param config.search The search string.
     * @param [config.cassSensitive] Controls whether the search should be case-sensitive.
     * @param [config.literal] When true, interpret the search string as a literal sequence of characters.
     * @param [config.regexp] When true, interpret the search string as a regular expression.
     * @param [config.replace] The replace text.
     */
    constructor(config) {
        this.search = config.search;
        this.caseSensitive = !!config.caseSensitive;
        this.regexp = !!config.regexp;
        this.replace = config.replace || "";
        this.valid = !!this.search && (!this.regexp || validRegExp(this.search));
        this.unquoted = config.literal ? this.search : this.search.replace(/\\([nrt\\])/g, (_, ch) => ch == "n" ? "\n" : ch == "r" ? "\r" : ch == "t" ? "\t" : "\\");
    }
    /** Compare this query to another query. */
    eq(other) {
        return this.search == other.search && this.replace == other.replace &&
            this.caseSensitive == other.caseSensitive && this.regexp == other.regexp;
    }
    // @internal
    create() {
        return this.regexp ? new RegExpQuery(this) : new StringQuery(this);
    }
    /** Get a search cursor for this query, searching through the given range in the given document. */
    getCursor(doc, from = 0, to = doc.length) {
        return this.regexp ? regexpCursor(this, doc, from, to) : stringCursor(this, doc, from, to);
    }
}
class QueryType {
    constructor(spec) {
        this.spec = spec;
    }
}
function stringCursor(spec, doc, from, to) {
    return new SearchCursor(doc, spec.unquoted, from, to, spec.caseSensitive ? undefined : x => x.toLowerCase());
}
class StringQuery extends QueryType {
    constructor(spec) {
        super(spec);
    }
    nextMatch(doc, curFrom, curTo) {
        let cursor = stringCursor(this.spec, doc, curTo, doc.length).nextOverlapping();
        if (cursor.done)
            cursor = stringCursor(this.spec, doc, 0, curFrom).nextOverlapping();
        return cursor.done ? null : cursor.value;
    }
    // Searching in reverse is, rather than implementing inverted search cursor, done by scanning chunk after chunk forward.
    prevMatchInRange(doc, from, to) {
        for (let pos = to;;) {
            let start = Math.max(from, pos - 10000 /* ChunkSize */ - this.spec.unquoted.length);
            let cursor = stringCursor(this.spec, doc, start, pos), range = null;
            while (!cursor.nextOverlapping().done)
                range = cursor.value;
            if (range)
                return range;
            if (start == from)
                return null;
            pos -= 10000 /* ChunkSize */;
        }
    }
    prevMatch(doc, curFrom, curTo) {
        return this.prevMatchInRange(doc, 0, curFrom) ||
            this.prevMatchInRange(doc, curTo, doc.length);
    }
    getReplacement(_result) { return this.spec.replace; }
    matchAll(doc, limit) {
        let cursor = stringCursor(this.spec, doc, 0, doc.length), ranges = [];
        while (!cursor.next().done) {
            if (ranges.length >= limit)
                return null;
            ranges.push(cursor.value);
        }
        return ranges;
    }
    highlight(doc, from, to, add) {
        let cursor = stringCursor(this.spec, doc, Math.max(0, from - this.spec.unquoted.length), Math.min(to + this.spec.unquoted.length, doc.length));
        while (!cursor.next().done)
            add(cursor.value.from, cursor.value.to);
    }
}
function regexpCursor(spec, doc, from, to) {
    return new RegExpCursor(doc, spec.search, spec.caseSensitive ? undefined : { ignoreCase: true }, from, to);
}
class RegExpQuery extends QueryType {
    nextMatch(doc, curFrom, curTo) {
        let cursor = regexpCursor(this.spec, doc, curTo, doc.length).next();
        if (cursor.done)
            cursor = regexpCursor(this.spec, doc, 0, curFrom).next();
        return cursor.done ? null : cursor.value;
    }
    prevMatchInRange(doc, from, to) {
        for (let size = 1;; size++) {
            let start = Math.max(from, to - size * 10000 /* ChunkSize */);
            let cursor = regexpCursor(this.spec, doc, start, to), range = null;
            while (!cursor.next().done)
                range = cursor.value;
            if (range && (start == from || range.from > start + 10))
                return range;
            if (start == from)
                return null;
        }
    }
    prevMatch(doc, curFrom, curTo) {
        return this.prevMatchInRange(doc, 0, curFrom) ||
            this.prevMatchInRange(doc, curTo, doc.length);
    }
    getReplacement(result) {
        return this.spec.replace.replace(/\$([$&\d+])/g, (m, i) => i == "$" ? "$"
            : i == "&" ? result.match[0]
                : i != "0" && +i < result.match.length ? result.match[i]
                    : m);
    }
    matchAll(doc, limit) {
        let cursor = regexpCursor(this.spec, doc, 0, doc.length), ranges = [];
        while (!cursor.next().done) {
            if (ranges.length >= limit)
                return null;
            ranges.push(cursor.value);
        }
        return ranges;
    }
    highlight(doc, from, to, add) {
        let cursor = regexpCursor(this.spec, doc, Math.max(0, from - 250 /* HighlightMargin */), Math.min(to + 250 /* HighlightMargin */, doc.length));
        while (!cursor.next().done)
            add(cursor.value.from, cursor.value.to);
    }
}
/**
 * A state effect that updates the current search query. Note that this only has an effect if the search
 * state has been initialized (by including {@link search} in your configuration or by running
 * {@link openSearchPanel} at least once).
 */
const setSearchQuery = dist_state/* StateEffect.define */.Py.define();
const togglePanel = dist_state/* StateEffect.define */.Py.define();
const searchState = dist_state/* StateField.define */.QQ.define({
    create(state) {
        return new SearchState(defaultQuery(state).create(), null);
    },
    update(value, tr) {
        for (let effect of tr.effects) {
            if (effect.is(setSearchQuery))
                value = new SearchState(effect.value.create(), value.panel);
            else if (effect.is(togglePanel))
                value = new SearchState(value.query, effect.value ? createSearchPanel : null);
        }
        return value;
    },
    provide: f => view_panel/* showPanel.from */.mH.from(f, val => val.panel)
});
/** Get the current search query from an editor state. */
function getSearchQuery(state) {
    let curState = state.field(searchState, false);
    return curState ? curState.query.spec : defaultQuery(state);
}
class SearchState {
    constructor(query, panel) {
        this.query = query;
        this.panel = panel;
    }
}
const matchMark = decoration/* Decoration.mark */.p.mark({ class: "cm-searchMatch" }), selectedMatchMark = decoration/* Decoration.mark */.p.mark({ class: "cm-searchMatch cm-searchMatch-selected" });
const searchHighlighter = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.view = view;
        this.decorations = this.highlight(view.state.field(searchState));
    }
    update(update) {
        let state = update.state.field(searchState);
        if (state != update.startState.field(searchState) || update.docChanged || update.selectionSet || update.viewportChanged)
            this.decorations = this.highlight(state);
    }
    highlight({ query, panel }) {
        if (!panel || !query.spec.valid)
            return decoration/* Decoration.none */.p.none;
        let { view } = this;
        let builder = new dist_state/* RangeSetBuilder */.f_();
        for (let i = 0, ranges = view.visibleRanges, l = ranges.length; i < l; i++) {
            let { from, to } = ranges[i];
            while (i < l - 1 && to > ranges[i + 1].from - 2 * 250 /* HighlightMargin */)
                to = ranges[++i].to;
            query.highlight(view.state.doc, from, to, (from, to) => {
                let selected = view.state.selection.ranges.some(r => r.from == from && r.to == to);
                builder.add(from, to, selected ? selectedMatchMark : matchMark);
            });
        }
        return builder.finish();
    }
}, {
    decorations: v => v.decorations
});
function searchCommand(f) {
    return view => {
        let state = view.state.field(searchState, false);
        return state && state.query.spec.valid ? f(view, state) : openSearchPanel(view);
    };
}
/**
 * Open the search panel if it isn't already open, and move the selection to the first match
 * after the current main selection. Will wrap around to the start of the document when it
 * reaches the end.
 */
const findNext = searchCommand((view, { query }) => {
    let { from, to } = view.state.selection.main;
    let next = query.nextMatch(view.state.doc, from, to);
    if (!next || next.from == from && next.to == to)
        return false;
    view.dispatch({
        selection: { anchor: next.from, head: next.to },
        scrollIntoView: true,
        effects: announceMatch(view, next),
        userEvent: "select.search"
    });
    return true;
});
/**
 * Move the selection to the previous instance of the search query, before the current main selection.
 * Will wrap past the start of the document to start searching at the end again.
 */
const findPrevious = searchCommand((view, { query }) => {
    let { state } = view, { from, to } = state.selection.main;
    let range = query.prevMatch(state.doc, from, to);
    if (!range)
        return false;
    view.dispatch({
        selection: { anchor: range.from, head: range.to },
        scrollIntoView: true,
        effects: announceMatch(view, range),
        userEvent: "select.search"
    });
    return true;
});
/** Select all instances of the search query. */
const selectMatches = searchCommand((view, { query }) => {
    let ranges = query.matchAll(view.state.doc, 1000);
    if (!ranges || !ranges.length)
        return false;
    view.dispatch({
        selection: dist_state/* EditorSelection.create */.jT.create(ranges.map(r => dist_state/* EditorSelection.range */.jT.range(r.from, r.to))),
        userEvent: "select.search.matches"
    });
    return true;
});
/** Select all instances of the currently selected text. */
const selectSelectionMatches = ({ state, dispatch }) => {
    let sel = state.selection;
    if (sel.ranges.length > 1 || sel.main.empty)
        return false;
    let { from, to } = sel.main;
    let ranges = [], main = 0;
    for (let cur = new SearchCursor(state.doc, state.sliceDoc(from, to)); !cur.next().done;) {
        if (ranges.length > 1000)
            return false;
        if (cur.value.from == from)
            main = ranges.length;
        ranges.push(dist_state/* EditorSelection.range */.jT.range(cur.value.from, cur.value.to));
    }
    dispatch(state.update({
        selection: dist_state/* EditorSelection.create */.jT.create(ranges, main),
        userEvent: "select.search.matches"
    }));
    return true;
};
/** Replace the current match of the search query. */
const replaceNext = searchCommand((view, { query }) => {
    let { state } = view, { from, to } = state.selection.main;
    if (state.readOnly)
        return false;
    let next = query.nextMatch(state.doc, from, from);
    if (!next)
        return false;
    let changes = [], selection, replacement;
    if (next.from == from && next.to == to) {
        replacement = state.toText(query.getReplacement(next));
        changes.push({ from: next.from, to: next.to, insert: replacement });
        next = query.nextMatch(state.doc, next.from, next.to);
    }
    if (next) {
        let off = changes.length == 0 || changes[0].from >= next.to ? 0 : next.to - next.from - replacement.length;
        selection = { anchor: next.from - off, head: next.to - off };
    }
    view.dispatch({
        changes, selection,
        scrollIntoView: !!selection,
        effects: next ? announceMatch(view, next) : undefined,
        userEvent: "input.replace"
    });
    return true;
});
/** Replace all instances of the search query with the given replacement. */
const replaceAll = searchCommand((view, { query }) => {
    if (view.state.readOnly)
        return false;
    let changes = query.matchAll(view.state.doc, 1e9).map(match => {
        let { from, to } = match;
        return { from, to, insert: query.getReplacement(match) };
    });
    if (!changes.length)
        return false;
    view.dispatch({
        changes,
        userEvent: "input.replace.all"
    });
    return true;
});
function createSearchPanel(view) {
    return view.state.facet(searchConfigFacet).createPanel(view);
}
function defaultQuery(state, fallback) {
    var _a;
    let sel = state.selection.main;
    let selText = sel.empty || sel.to > sel.from + 100 ? "" : state.sliceDoc(sel.from, sel.to);
    let caseSensitive = (_a = fallback === null || fallback === void 0 ? void 0 : fallback.caseSensitive) !== null && _a !== void 0 ? _a : state.facet(searchConfigFacet).caseSensitive;
    return fallback && !selText ? fallback : new SearchQuery({ search: selText.replace(/\n/g, "\\n"), caseSensitive });
}
/** Make sure the search panel is open and focused. */
const openSearchPanel = view => {
    let state = view.state.field(searchState, false);
    if (state && state.panel) {
        let panel = (0,view_panel/* getPanel */.Sd)(view, createSearchPanel);
        if (!panel)
            return false;
        let searchInput = panel.dom.querySelector("[name=search]");
        if (searchInput != view.root.activeElement) {
            let query = defaultQuery(view.state, state.query.spec);
            if (query.valid)
                view.dispatch({ effects: setSearchQuery.of(query) });
            searchInput.focus();
            searchInput.select();
        }
    }
    else {
        view.dispatch({ effects: [
                togglePanel.of(true),
                state ? setSearchQuery.of(defaultQuery(view.state, state.query.spec)) : dist_state/* StateEffect.appendConfig.of */.Py.appendConfig.of(searchExtensions)
            ] });
    }
    return true;
};
/** Close the search panel. */
const closeSearchPanel = view => {
    let state = view.state.field(searchState, false);
    if (!state || !state.panel)
        return false;
    let panel = (0,view_panel/* getPanel */.Sd)(view, createSearchPanel);
    if (panel && panel.dom.contains(view.root.activeElement))
        view.focus();
    view.dispatch({ effects: togglePanel.of(false) });
    return true;
};
/**
 * Default search-related key bindings.
 *
 *  - Mod-f: {@link openSearchPanel}
 *  - F3, Mod-g: {@link findNext}
 *  - Shift-F3, Shift-Mod-g: {@link findPrevious}
 *  - Alt-g: {@link gotoLine}
 *  - Mod-d: {@link selectNextOccurrence}
 */
const searchKeymap = [
    { key: "Mod-f", run: openSearchPanel, scope: "editor search-panel" },
    { key: "F3", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
    { key: "Mod-g", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
    { key: "Escape", run: closeSearchPanel, scope: "editor search-panel" },
    { key: "Mod-Shift-l", run: selectSelectionMatches },
    { key: "Alt-g", run: gotoLine },
    { key: "Mod-d", run: selectNextOccurrence, preventDefault: true },
];
class SearchPanel {
    constructor(view) {
        this.view = view;
        let query = this.query = view.state.field(searchState).query.spec;
        this.commit = this.commit.bind(this);
        this.searchField = crelt("input", {
            value: query.search,
            placeholder: phrase(view, "Find"),
            "aria-label": phrase(view, "Find"),
            class: "cm-textfield",
            name: "search",
            onchange: this.commit,
            onkeyup: this.commit
        });
        this.replaceField = crelt("input", {
            value: query.replace,
            placeholder: phrase(view, "Replace"),
            "aria-label": phrase(view, "Replace"),
            class: "cm-textfield",
            name: "replace",
            onchange: this.commit,
            onkeyup: this.commit
        });
        this.caseField = crelt("input", {
            type: "checkbox",
            name: "case",
            checked: query.caseSensitive,
            onchange: this.commit
        });
        this.reField = crelt("input", {
            type: "checkbox",
            name: "re",
            checked: query.regexp,
            onchange: this.commit
        });
        function button(name, onclick, content) {
            return crelt("button", { class: "cm-button", name, onclick, type: "button" }, content);
        }
        this.dom = crelt("div", { onkeydown: (e) => this.keydown(e), class: "cm-search" }, [
            this.searchField,
            button("next", () => findNext(view), [phrase(view, "next")]),
            button("prev", () => findPrevious(view), [phrase(view, "previous")]),
            button("select", () => selectMatches(view), [phrase(view, "all")]),
            crelt("label", null, [this.caseField, phrase(view, "match case")]),
            crelt("label", null, [this.reField, phrase(view, "regexp")]),
            ...view.state.readOnly ? [] : [
                crelt("br"),
                this.replaceField,
                button("replace", () => replaceNext(view), [phrase(view, "replace")]),
                button("replaceAll", () => replaceAll(view), [phrase(view, "replace all")]),
                crelt("button", {
                    name: "close",
                    onclick: () => closeSearchPanel(view),
                    "aria-label": phrase(view, "close"),
                    type: "button"
                }, ["×"])
            ]
        ]);
    }
    commit() {
        let query = new SearchQuery({
            search: this.searchField.value,
            caseSensitive: this.caseField.checked,
            regexp: this.reField.checked,
            replace: this.replaceField.value
        });
        if (!query.eq(this.query)) {
            this.query = query;
            this.view.dispatch({ effects: setSearchQuery.of(query) });
        }
    }
    keydown(e) {
        if (runScopeHandlers(this.view, e, "search-panel")) {
            e.preventDefault();
        }
        else if (e.keyCode == 13 && e.target == this.searchField) {
            e.preventDefault();
            (e.shiftKey ? findPrevious : findNext)(this.view);
        }
        else if (e.keyCode == 13 && e.target == this.replaceField) {
            e.preventDefault();
            replaceNext(this.view);
        }
    }
    update(update) {
        for (let tr of update.transactions)
            for (let effect of tr.effects) {
                if (effect.is(setSearchQuery) && !effect.value.eq(this.query))
                    this.setQuery(effect.value);
            }
    }
    setQuery(query) {
        this.query = query;
        this.searchField.value = query.search;
        this.replaceField.value = query.replace;
        this.caseField.checked = query.caseSensitive;
        this.reField.checked = query.regexp;
    }
    mount() {
        this.searchField.select();
    }
    get pos() { return 80; }
    get top() { return this.view.state.facet(searchConfigFacet).top; }
}
function phrase(view, phrase) { return view.state.phrase(phrase); }
const AnnounceMargin = 30;
const Break = /[\s\.,:;?!]/;
function announceMatch(view, { from, to }) {
    let lineStart = view.state.doc.lineAt(from).from, lineEnd = view.state.doc.lineAt(to).to;
    let start = Math.max(lineStart, from - AnnounceMargin), end = Math.min(lineEnd, to + AnnounceMargin);
    let text = view.state.sliceDoc(start, end);
    if (start != lineStart) {
        for (let i = 0; i < AnnounceMargin; i++)
            if (!Break.test(text[i + 1]) && Break.test(text[i])) {
                text = text.slice(i);
                break;
            }
    }
    if (end != lineEnd) {
        for (let i = text.length - 1; i > text.length - AnnounceMargin; i--)
            if (!Break.test(text[i - 1]) && Break.test(text[i])) {
                text = text.slice(0, i);
                break;
            }
    }
    return editorview/* EditorView.announce.of */.t.announce.of(`${view.state.phrase("current match")}. ${text} ${view.state.phrase("on line")} ${view.state.doc.lineAt(from).number}`);
}
const search_baseTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-panel.cm-search": {
        padding: "2px 6px 4px",
        position: "relative",
        "& [name=close]": {
            position: "absolute",
            top: "0",
            right: "4px",
            backgroundColor: "inherit",
            border: "none",
            font: "inherit",
            padding: 0,
            margin: 0
        },
        "& input, & button, & label": {
            margin: ".2em .6em .2em 0"
        },
        "& input[type=checkbox]": {
            marginRight: ".2em"
        },
        "& label": {
            fontSize: "80%",
            whiteSpace: "pre"
        }
    },
    "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
    "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
    "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
    "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
});
const searchExtensions = [
    searchState,
    dist_state/* Prec.lowest */.Wl.lowest(searchHighlighter),
    search_baseTheme
];

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/search/index.js







;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/completion.js


class CompletionContext {
    constructor(state, pos, explicit) {
        this.state = state;
        this.pos = pos;
        this.explicit = explicit;
        // @internal
        this.abortListeners = [];
    }
    tokenBefore(types) {
        let token = language_syntaxTree(this.state).resolveInner(this.pos, -1);
        while (token && types.indexOf(token.name) < 0)
            token = token.parent;
        return token ? { from: token.from, to: this.pos,
            text: this.state.sliceDoc(token.from, this.pos),
            type: token.type } : null;
    }
    /** @return Get the match of ythe given expression directly before the cursor */
    matchBefore(expr) {
        let line = this.state.doc.lineAt(this.pos);
        let start = Math.max(line.from, this.pos - 250);
        let str = line.text.slice(start - line.from, this.pos - line.from);
        let found = str.search(ensureAnchor(expr, false));
        return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
    }
    get aborted() {
        return this.abortListeners == null;
    }
    addEventListener(type, listener) {
        if (type == "abort" && this.abortListeners)
            this.abortListeners.push(listener);
    }
}
function toSet(chars) {
    let flat = Object.keys(chars).join("");
    let words = /\w/.test(flat);
    if (words)
        flat = flat.replace(/\w/g, "");
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
    let first = Object.create(null), rest = Object.create(null);
    for (let { label } of options) {
        first[label[0]] = true;
        for (let i = 1; i < label.length; i++)
            rest[label[i]] = true;
    }
    let source = toSet(first) + toSet(rest) + "*$";
    return [new RegExp("^" + source), new RegExp(source)];
}
function completeFromList(list) {
    let options = list.map(o => typeof o == "string" ? { label: o } : o);
    let [validFor, match] = options.every(o => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
    return (context) => {
        let token = context.matchBefore(match);
        return token || context.explicit ? { from: token ? token.from : context.pos, options, validFor } : null;
    };
}
/** Wrap the given completion source so that it will only fire when the cursor is in a syntax node with on of the given names */
function ifIn(nodes, source) {
    return (context) => {
        for (let pos = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1)
                return source(context);
        return null;
    };
}
/**  Wrap the given completion source so that it will not fire when the cursor is in a syntax node with one of the given names. */
function ifNotIn(nodes, source) {
    return (context) => {
        for (let pos = language_syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1)
                return null;
        return source(context);
    };
}
class Option {
    constructor(completion, source, match) {
        this.completion = completion;
        this.source = source;
        this.match = match;
    }
}
function cur(state) { return state.selection.main.head; }
function ensureAnchor(expr, start) {
    var _a;
    let { source } = expr;
    let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
    if (!addStart && !addEnd)
        return expr;
    return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a = expr.flags) !== null && _a !== void 0 ? _a : (expr.ignoreCase ? "i" : ""));
}
const pickedCompletion = dist_state/* Annotation.define */.q6.define();
function applyCompletion(view, option) {
    const apply = option.completion.apply || option.completion.label;
    let result = option.source;
    if (typeof apply == "string") {
        view.dispatch(view.state.changeByRange(range => {
            if (range == view.state.selection.main)
                return {
                    changes: { from: result.from, to: result.to, insert: apply },
                    range: dist_state/* EditorSelection.cursor */.jT.cursor(result.from + apply.length)
                };
            let len = result.to - result.from;
            if (!range.empty ||
                len && view.state.sliceDoc(range.from - len, range.from) != view.state.sliceDoc(result.from, result.to))
                return { range };
            return {
                changes: { from: range.from - len, to: range.from, insert: apply },
                range: dist_state/* EditorSelection.cursor */.jT.cursor(range.from - len + apply.length)
            };
        }), {
            userEvent: "input.complete",
            annotations: pickedCompletion.of(option.completion)
        });
    }
    else {
        apply(view, option.completion, result.from, result.to);
    }
}
const SourceCache = new WeakMap();
function asSource(source) {
    if (!Array.isArray(source))
        return source;
    let known = SourceCache.get(source);
    if (!known)
        SourceCache.set(source, known = completeFromList(source));
    return known;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/filter.js

/** A pattern matcher for fuzzy completion matching. Create an instance once for a pattern, and then use that to match any number of completions. */
class FuzzyMatcher {
    constructor(pattern) {
        this.pattern = pattern;
        this.chars = [];
        this.folded = [];
        // Buffers reused by calls to `match` to track matched character positions.
        this.any = [];
        this.precise = [];
        this.byWord = [];
        for (let p = 0; p < pattern.length;) {
            let char = (0,dist_state/* codePointAt */.gm)(pattern, p), size = (0,dist_state/* codePointSize */.nZ)(char);
            this.chars.push(char);
            let part = pattern.slice(p, p + size), upper = part.toUpperCase();
            this.folded.push((0,dist_state/* codePointAt */.gm)(upper == part ? part.toLowerCase() : upper, 0));
            p += size;
        }
        this.astral = pattern.length != this.chars.length;
    }
    /** Matches a given word (completion) against the pattern (input). */
    match(word) {
        if (this.pattern.length == 0)
            return [0];
        if (word.length < this.pattern.length)
            return null;
        let { chars, folded, any, precise, byWord } = this;
        // For single-character queries, only match when they occur right at the start
        if (chars.length == 1) {
            let first = (0,dist_state/* codePointAt */.gm)(word, 0);
            return first == chars[0] ? [0, 0, (0,dist_state/* codePointSize */.nZ)(first)] :
                first == folded[0] ? [-200 /* CaseFold */, 0, (0,dist_state/* codePointSize */.nZ)(first)] : null;
        }
        let direct = word.indexOf(this.pattern);
        if (direct == 0)
            return [0, 0, this.pattern.length];
        let len = chars.length, anyTo = 0;
        if (direct < 0) {
            for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len;) {
                let next = (0,dist_state/* codePointAt */.gm)(word, i);
                if (next == chars[anyTo] || next == folded[anyTo])
                    any[anyTo++] = i;
                i += (0,dist_state/* codePointSize */.nZ)(next);
            }
            // No match, exit immediately
            if (anyTo < len)
                return null;
        }
        // This tracks the extent of the precise (non-folded, not necessarily adjacent) match
        let preciseTo = 0;
        // Tracks whether there is a match that hits only characters that appear to be starting words. `byWordFolded` is set to true when
        // a case folded character is encountered in such a match
        let byWordTo = 0, byWordFolded = false;
        // If we've found a partial adjacent match, these track its state
        let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
        let hasLower = /[a-z]/.test(word), wordAdjacent = true;
        // Go over the option's text, scanning for the various kinds of matches
        for (let i = 0, e = Math.min(word.length, 200), prevType = 0 /* NonWord */; i < e && byWordTo < len;) {
            let next = (0,dist_state/* codePointAt */.gm)(word, i);
            if (direct < 0) {
                if (preciseTo < len && next == chars[preciseTo])
                    precise[preciseTo++] = i;
                if (adjacentTo < len) {
                    if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
                        if (adjacentTo == 0)
                            adjacentStart = i;
                        adjacentEnd = i + 1;
                        adjacentTo++;
                    }
                    else {
                        adjacentTo = 0;
                    }
                }
            }
            let ch, type = next < 0xff ?
                (next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 /* Lower */ : next >= 65 && next <= 90 ? 1 /* Upper */ : 0 /* NonWord */) :
                ((ch = (0,dist_state/* fromCodePoint */.bg)(next)) != ch.toLowerCase() ? 1 /* Upper */ : ch != ch.toUpperCase() ? 2 /* Lower */ : 0 /* NonWord */);
            if (!i || type == 1 /* Upper */ && hasLower || prevType == 0 /* NonWord */ && type != 0 /* NonWord */) {
                if (chars[byWordTo] == next || (folded[byWordTo] == next && (byWordFolded = true)))
                    byWord[byWordTo++] = i;
                else if (byWord.length)
                    wordAdjacent = false;
            }
            prevType = type;
            i += (0,dist_state/* codePointSize */.nZ)(next);
        }
        if (byWordTo == len && byWord[0] == 0 && wordAdjacent)
            return this.result(-100 /* ByWord */ + (byWordFolded ? -200 /* CaseFold */ : 0), byWord, word);
        if (adjacentTo == len && adjacentStart == 0)
            return [-200 /* CaseFold */ - word.length, 0, adjacentEnd];
        if (direct > -1)
            return [-700 /* NotStart */ - word.length, direct, direct + this.pattern.length];
        if (adjacentTo == len)
            return [-200 /* CaseFold */ + -700 /* NotStart */ - word.length, adjacentStart, adjacentEnd];
        if (byWordTo == len)
            return this.result(-100 /* ByWord */ + (byWordFolded ? -200 /* CaseFold */ : 0) + -700 /* NotStart */ +
                (wordAdjacent ? 0 : -1100 /* Gap */), byWord, word);
        return chars.length == 2 ? null : this.result((any[0] ? -700 /* NotStart */ : 0) + -200 /* CaseFold */ + -1100 /* Gap */, any, word);
    }
    result(score, positions, word) {
        let result = [score - word.length], i = 1;
        for (let pos of positions) {
            let to = pos + (this.astral ? (0,dist_state/* codePointSize */.nZ)((0,dist_state/* codePointAt */.gm)(word, pos)) : 1);
            if (i > 1 && result[i - 1] == pos)
                result[i - 1] = to;
            else {
                result[i++] = pos;
                result[i++] = to;
            }
        }
        return result;
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/config.js

const completionConfig = dist_state/* Facet.define */.r$.define({
    combine(configs) {
        return (0,dist_state/* combineConfig */.BO)(configs, {
            activateOnTyping: true,
            override: null,
            maxRenderedOptions: 100,
            defaultKeymap: true,
            optionClass: () => "",
            aboveCursor: false,
            icons: true,
            addToOptions: []
        }, {
            defaultKeymap: (a, b) => a && b,
            icons: (a, b) => a && b,
            optionClass: (a, b) => c => joinClass(a(c), b(c)),
            addToOptions: (a, b) => a.concat(b)
        });
    }
});
function joinClass(a, b) {
    return a ? b ? a + " " + b : a : b;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/tooltip.js



function optionContent(config) {
    let content = config.addToOptions.slice();
    if (config.icons)
        content.push({
            render(completion) {
                let icon = document.createElement("div");
                icon.classList.add("cm-completionIcon");
                if (completion.type)
                    icon.classList.add(...completion.type.split(/\s+/g).map(cls => "cm-completionIcon-" + cls));
                icon.setAttribute("aria-hidden", "true");
                return icon;
            },
            position: 20
        });
    content.push({
        render(completion, _s, match) {
            let labelElt = document.createElement("span");
            labelElt.className = "cm-completionLabel";
            let { label } = completion, off = 0;
            for (let j = 1; j < match.length;) {
                let from = match[j++], to = match[j++];
                if (from > off)
                    labelElt.appendChild(document.createTextNode(label.slice(off, from)));
                let span = labelElt.appendChild(document.createElement("span"));
                span.appendChild(document.createTextNode(label.slice(from, to)));
                span.className = "cm-completionMatchedText";
                off = to;
            }
            if (off < label.length)
                labelElt.appendChild(document.createTextNode(label.slice(off)));
            return labelElt;
        },
        position: 50
    }, {
        render(completion) {
            if (!completion.detail)
                return null;
            let detailElt = document.createElement("span");
            detailElt.className = "cm-completionDetail";
            detailElt.textContent = completion.detail;
            return detailElt;
        },
        position: 80
    });
    return content.sort((a, b) => a.position - b.position).map(a => a.render);
}
function rangeAroundSelected(total, selected, max) {
    if (total <= max)
        return { from: 0, to: total };
    if (selected <= (total >> 1)) {
        let off = Math.floor(selected / max);
        return { from: off * max, to: (off + 1) * max };
    }
    let off = Math.floor((total - selected) / max);
    return { from: total - (off + 1) * max, to: total - off * max };
}
class CompletionTooltip {
    constructor(view, stateField) {
        this.view = view;
        this.stateField = stateField;
        this.info = null;
        this.placeInfo = {
            read: () => this.measureInfo(),
            write: (pos) => this.positionInfo(pos),
            key: this
        };
        let cState = view.state.field(stateField);
        let { options, selected } = cState.open;
        let config = view.state.facet(completionConfig);
        this.optionContent = optionContent(config);
        this.optionClass = config.optionClass;
        this.range = rangeAroundSelected(options.length, selected, config.maxRenderedOptions);
        this.dom = document.createElement("div");
        this.dom.className = "cm-tooltip-autocomplete";
        this.dom.addEventListener("mousedown", (e) => {
            for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
                if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options.length) {
                    applyCompletion(view, options[+match[1]]);
                    e.preventDefault();
                    return;
                }
            }
        });
        this.list = this.dom.appendChild(this.createListBox(options, cState.id, this.range));
        this.list.addEventListener("scroll", () => {
            if (this.info)
                this.view.requestMeasure(this.placeInfo);
        });
    }
    mount() {
        this.updateSel();
    }
    update(update) {
        if (update.state.field(this.stateField) != update.startState.field(this.stateField))
            this.updateSel();
    }
    positioned() {
        if (this.info)
            this.view.requestMeasure(this.placeInfo);
    }
    updateSel() {
        let cState = this.view.state.field(this.stateField), open = cState.open;
        if (open.selected < this.range.from || open.selected >= this.range.to) {
            this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
            this.list.remove();
            this.list = this.dom.appendChild(this.createListBox(open.options, cState.id, this.range));
            this.list.addEventListener("scroll", () => {
                if (this.info)
                    this.view.requestMeasure(this.placeInfo);
            });
        }
        if (this.updateSelectedOption(open.selected)) {
            if (this.info) {
                this.info.remove();
                this.info = null;
            }
            let { completion } = open.options[open.selected];
            let { info } = completion;
            if (!info)
                return;
            let infoResult = typeof info === 'string' ? document.createTextNode(info) : info(completion);
            if (!infoResult)
                return;
            if ('then' in infoResult) {
                infoResult.then(node => {
                    if (node && this.view.state.field(this.stateField, false) == cState)
                        this.addInfoPane(node);
                }).catch(e => (0,extension/* logException */.OO)(this.view.state, e, "completion info"));
            }
            else {
                this.addInfoPane(infoResult);
            }
        }
    }
    addInfoPane(content) {
        let dom = this.info = document.createElement("div");
        dom.className = "cm-tooltip cm-completionInfo";
        dom.appendChild(content);
        this.dom.appendChild(dom);
        this.view.requestMeasure(this.placeInfo);
    }
    updateSelectedOption(selected) {
        let set = null;
        for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
            if (i == selected) {
                if (!opt.hasAttribute("aria-selected")) {
                    opt.setAttribute("aria-selected", "true");
                    set = opt;
                }
            }
            else {
                if (opt.hasAttribute("aria-selected"))
                    opt.removeAttribute("aria-selected");
            }
        }
        if (set)
            scrollIntoView(this.list, set);
        return set;
    }
    measureInfo() {
        let sel = this.dom.querySelector("[aria-selected]");
        if (!sel || !this.info)
            return null;
        let listRect = this.dom.getBoundingClientRect();
        let infoRect = this.info.getBoundingClientRect();
        let selRect = sel.getBoundingClientRect();
        if (selRect.top > Math.min(innerHeight, listRect.bottom) - 10 || selRect.bottom < Math.max(0, listRect.top) + 10)
            return null;
        let top = Math.max(0, Math.min(selRect.top, innerHeight - infoRect.height)) - listRect.top;
        let left = this.view.textDirection == view_bidi/* Direction.RTL */.Nm.RTL;
        let spaceLeft = listRect.left, spaceRight = innerWidth - listRect.right;
        if (left && spaceLeft < Math.min(infoRect.width, spaceRight))
            left = false;
        else if (!left && spaceRight < Math.min(infoRect.width, spaceLeft))
            left = true;
        return { top, left };
    }
    positionInfo(pos) {
        if (this.info) {
            this.info.style.top = (pos ? pos.top : -1e6) + "px";
            if (pos) {
                this.info.classList.toggle("cm-completionInfo-left", pos.left);
                this.info.classList.toggle("cm-completionInfo-right", !pos.left);
            }
        }
    }
    createListBox(options, id, range) {
        const ul = document.createElement("ul");
        ul.id = id;
        ul.setAttribute("role", "listbox");
        ul.setAttribute("aria-expanded", "true");
        for (let i = range.from; i < range.to; i++) {
            let { completion, match } = options[i];
            const li = ul.appendChild(document.createElement("li"));
            li.id = id + "-" + i;
            li.setAttribute("role", "option");
            let cls = this.optionClass(completion);
            if (cls)
                li.className = cls;
            for (let source of this.optionContent) {
                let node = source(completion, this.view.state, match);
                if (node)
                    li.appendChild(node);
            }
        }
        if (range.from)
            ul.classList.add("cm-completionListIncompleteTop");
        if (range.to < options.length)
            ul.classList.add("cm-completionListIncompleteBottom");
        return ul;
    }
}
/** We allocate a new function instance every time the completion changes to force redrawing/repositioning of the tooltip */
function completionTooltip(stateField) {
    return (view) => new CompletionTooltip(view, stateField);
}
function scrollIntoView(container, element) {
    let parent = container.getBoundingClientRect();
    let self = element.getBoundingClientRect();
    if (self.top < parent.top)
        container.scrollTop -= parent.top - self.top;
    else if (self.bottom > parent.bottom)
        container.scrollTop += self.bottom - parent.bottom;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/state.js






// Used to pick a preferred option when two options with the same label occur in the result.
function score(option) {
    return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) +
        (option.type ? 1 : 0);
}
function sortOptions(active, state) {
    let options = [], i = 0;
    for (let a of active)
        if (a.hasResult()) {
            if (a.result.filter === false) {
                for (let option of a.result.options)
                    options.push(new Option(option, a, [1e9 - i++]));
            }
            else {
                let matcher = new FuzzyMatcher(state.sliceDoc(a.from, a.to)), match;
                for (let option of a.result.options)
                    if (match = matcher.match(option.label)) {
                        if (option.boost != null)
                            match[0] += option.boost;
                        options.push(new Option(option, a, match));
                    }
            }
        }
    let result = [], prev = null;
    for (let opt of options.sort(cmpOption)) {
        if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail ||
            (prev.type != null && opt.completion.type != null && prev.type != opt.completion.type) ||
            prev.apply != opt.completion.apply)
            result.push(opt);
        else if (score(opt.completion) > score(prev))
            result[result.length - 1] = opt;
        prev = opt.completion;
    }
    return result;
}
class CompletionDialog {
    constructor(options, attrs, tooltip, timestamp, selected) {
        this.options = options;
        this.attrs = attrs;
        this.tooltip = tooltip;
        this.timestamp = timestamp;
        this.selected = selected;
    }
    setSelected(selected, id) {
        return selected == this.selected || selected >= this.options.length ? this :
            new CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected);
    }
    static build(active, state, id, prev, conf) {
        let options = sortOptions(active, state);
        if (!options.length)
            return null;
        let selected = 0;
        if (prev && prev.selected) {
            let selectedValue = prev.options[prev.selected].completion;
            for (let i = 0; i < options.length; i++)
                if (options[i].completion == selectedValue) {
                    selected = i;
                    break;
                }
        }
        return new CompletionDialog(options, makeAttrs(id, selected), {
            pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
            create: completionTooltip(state_completionState),
            above: conf.aboveCursor,
        }, prev ? prev.timestamp : Date.now(), selected);
    }
    map(changes) {
        return new CompletionDialog(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: changes.mapPos(this.tooltip.pos) }), this.timestamp, this.selected);
    }
}
class CompletionState {
    constructor(active, id, open) {
        this.active = active;
        this.id = id;
        this.open = open;
    }
    static start() {
        return new CompletionState(state_none, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
    }
    update(tr) {
        let { state } = tr, conf = state.facet(completionConfig);
        let sources = conf.override ||
            state.languageDataAt("autocomplete", cur(state)).map(asSource);
        let active = sources.map(source => {
            let value = this.active.find(s => s.source == source) ||
                new ActiveSource(source, this.active.some(a => a.state != 0 /* Inactive */) ? 1 /* Pending */ : 0 /* Inactive */);
            return value.update(tr, conf);
        });
        if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
            active = this.active;
        let open = tr.selection || active.some(a => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) ||
            !sameResults(active, this.active) ? CompletionDialog.build(active, state, this.id, this.open, conf)
            : this.open && tr.docChanged ? this.open.map(tr.changes) : this.open;
        if (!open && active.every(a => a.state != 1 /* Pending */) && active.some(a => a.hasResult()))
            active = active.map(a => a.hasResult() ? new ActiveSource(a.source, 0 /* Inactive */) : a);
        for (let effect of tr.effects)
            if (effect.is(state_setSelectedEffect))
                open = open && open.setSelected(effect.value, this.id);
        return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
    }
    get tooltip() { return this.open ? this.open.tooltip : null; }
    get attrs() { return this.open ? this.open.attrs : baseAttrs; }
}
function sameResults(a, b) {
    if (a == b)
        return true;
    for (let iA = 0, iB = 0;;) {
        while (iA < a.length && !a[iA].hasResult)
            iA++;
        while (iB < b.length && !b[iB].hasResult)
            iB++;
        let endA = iA == a.length, endB = iB == b.length;
        if (endA || endB)
            return endA == endB;
        if (a[iA++].result != b[iB++].result)
            return false;
    }
}
const baseAttrs = {
    "aria-autocomplete": "list"
};
function makeAttrs(id, selected) {
    return {
        "aria-autocomplete": "list",
        "aria-haspopup": "listbox",
        "aria-activedescendant": id + "-" + selected,
        "aria-controls": id
    };
}
const state_none = [];
function cmpOption(a, b) {
    let dScore = b.match[0] - a.match[0];
    if (dScore)
        return dScore;
    return a.completion.label.localeCompare(b.completion.label);
}
function getUserEvent(tr) {
    return tr.isUserEvent("input.type") ? "input" : tr.isUserEvent("delete.backward") ? "delete" : null;
}
class ActiveSource {
    constructor(source, state, explicitPos = -1) {
        this.source = source;
        this.state = state;
        this.explicitPos = explicitPos;
    }
    hasResult() { return false; }
    update(tr, conf) {
        let event = getUserEvent(tr), value = this;
        if (event)
            value = value.handleUserEvent(tr, event, conf);
        else if (tr.docChanged)
            value = value.handleChange(tr);
        else if (tr.selection && value.state != 0 /* Inactive */)
            value = new ActiveSource(value.source, 0 /* Inactive */);
        for (let effect of tr.effects) {
            if (effect.is(startCompletionEffect))
                value = new ActiveSource(value.source, 1 /* Pending */, effect.value ? cur(tr.state) : -1);
            else if (effect.is(closeCompletionEffect))
                value = new ActiveSource(value.source, 0 /* Inactive */);
            else if (effect.is(setActiveEffect))
                for (let active of effect.value)
                    if (active.source == value.source)
                        value = active;
        }
        return value;
    }
    handleUserEvent(tr, type, conf) {
        return type == "delete" || !conf.activateOnTyping ? this.map(tr.changes) : new ActiveSource(this.source, 1 /* Pending */);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(this.source, 0 /* Inactive */) : this.map(tr.changes);
    }
    map(changes) {
        return changes.empty || this.explicitPos < 0 ? this : new ActiveSource(this.source, this.state, changes.mapPos(this.explicitPos));
    }
}
class ActiveResult extends ActiveSource {
    constructor(source, explicitPos, result, from, to) {
        super(source, 2 /* Result */, explicitPos);
        this.result = result;
        this.from = from;
        this.to = to;
    }
    hasResult() { return true; }
    handleUserEvent(tr, type, conf) {
        var _a;
        let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
        let pos = cur(tr.state);
        if ((this.explicitPos < 0 ? pos <= from : pos < this.from) ||
            pos > to ||
            type == "delete" && cur(tr.startState) == this.from)
            return new ActiveSource(this.source, type == "input" && conf.activateOnTyping ? 1 /* Pending */ : 0 /* Inactive */);
        let explicitPos = this.explicitPos < 0 ? -1 : tr.changes.mapPos(this.explicitPos), updated;
        if (checkValid(this.result.validFor, tr.state, from, to))
            return new ActiveResult(this.source, explicitPos, this.result, from, to);
        if (this.result.update &&
            (updated = this.result.update(this.result, from, to, new CompletionContext(tr.state, pos, explicitPos >= 0))))
            return new ActiveResult(this.source, explicitPos, updated, updated.from, (_a = updated.to) !== null && _a !== void 0 ? _a : cur(tr.state));
        return new ActiveSource(this.source, 1 /* Pending */, explicitPos);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(this.from, this.to) ? new ActiveSource(this.source, 0 /* Inactive */) : this.map(tr.changes);
    }
    map(mapping) {
        return mapping.empty ? this :
            new ActiveResult(this.source, this.explicitPos < 0 ? -1 : mapping.mapPos(this.explicitPos), this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1));
    }
}
function checkValid(validFor, state, from, to) {
    if (!validFor)
        return false;
    let text = state.sliceDoc(from, to);
    return typeof validFor == "function" ? validFor(text, from, to, state) : ensureAnchor(validFor, true).test(text);
}
const startCompletionEffect = dist_state/* StateEffect.define */.Py.define();
const closeCompletionEffect = dist_state/* StateEffect.define */.Py.define();
const setActiveEffect = dist_state/* StateEffect.define */.Py.define({
    map(sources, mapping) { return sources.map(s => s.map(mapping)); }
});
const state_setSelectedEffect = dist_state/* StateEffect.define */.Py.define();
const state_completionState = dist_state/* StateField.define */.QQ.define({
    create() { return CompletionState.start(); },
    update(value, tr) { return value.update(tr); },
    provide: f => [
        showTooltip.from(f, val => val.tooltip),
        editorview/* EditorView.contentAttributes.from */.t.contentAttributes.from(f, state => state.attrs)
    ]
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/view.js




const CompletionInteractMargin = 75;
/** Returns a command that moves the completion selection forward or backward by the given amount. */
function moveCompletionSelection(forward, by = "option") {
    return (view) => {
        let cState = view.state.field(state_completionState, false);
        if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
            return false;
        let step = 1, tooltip;
        if (by == "page" && (tooltip = getTooltip(view, cState.open.tooltip)))
            step = Math.max(2, Math.floor(tooltip.dom.offsetHeight / tooltip.dom.querySelector("li").offsetHeight) - 1);
        let selected = cState.open.selected + step * (forward ? 1 : -1), { length } = cState.open.options;
        if (selected < 0)
            selected = by == "page" ? 0 : length - 1;
        else if (selected >= length)
            selected = by == "page" ? length - 1 : 0;
        view.dispatch({ effects: state_setSelectedEffect.of(selected) });
        return true;
    };
}
/** Accept the current completion. */
const acceptCompletion = (view) => {
    let cState = view.state.field(state_completionState, false);
    if (view.state.readOnly || !cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
        return false;
    applyCompletion(view, cState.open.options[cState.open.selected]);
    return true;
};
/** Explicitly start autocompletion. */
const startCompletion = (view) => {
    let cState = view.state.field(state_completionState, false);
    if (!cState)
        return false;
    view.dispatch({ effects: startCompletionEffect.of(true) });
    return true;
};
/** Close the currently active completion. */
const closeCompletion = (view) => {
    let cState = view.state.field(state_completionState, false);
    if (!cState || !cState.active.some(a => a.state != 0 /* Inactive */))
        return false;
    view.dispatch({ effects: closeCompletionEffect.of(null) });
    return true;
};
class RunningQuery {
    constructor(active, context) {
        this.active = active;
        this.context = context;
        this.time = Date.now();
        this.updates = [];
        // Note that 'undefined' means 'not done yet', whereas 'null' means 'query returned null'.
        this.done = undefined;
    }
}
const DebounceTime = 50, MaxUpdateCount = 50, MinAbortTime = 1000;
const completionPlugin = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.view = view;
        this.debounceUpdate = -1;
        this.running = [];
        this.debounceAccept = -1;
        this.composing = 0 /* None */;
        for (let active of view.state.field(state_completionState).active)
            if (active.state == 1 /* Pending */)
                this.startQuery(active);
    }
    update(update) {
        let cState = update.state.field(state_completionState);
        if (!update.selectionSet && !update.docChanged && update.startState.field(state_completionState) == cState)
            return;
        let doesReset = update.transactions.some(tr => {
            return (tr.selection || tr.docChanged) && !getUserEvent(tr);
        });
        for (let i = 0; i < this.running.length; i++) {
            let query = this.running[i];
            if (doesReset ||
                query.updates.length + update.transactions.length > MaxUpdateCount && Date.now() - query.time > MinAbortTime) {
                for (let handler of query.context.abortListeners) {
                    try {
                        handler();
                    }
                    catch (e) {
                        (0,extension/* logException */.OO)(this.view.state, e);
                    }
                }
                query.context.abortListeners = null;
                this.running.splice(i--, 1);
            }
            else {
                query.updates.push(...update.transactions);
            }
        }
        if (this.debounceUpdate > -1)
            clearTimeout(this.debounceUpdate);
        this.debounceUpdate = cState.active.some(a => a.state == 1 /* Pending */ && !this.running.some(q => q.active.source == a.source)) ?
            setTimeout(() => this.startUpdate(), DebounceTime) : -1;
        if (this.composing != 0 /* None */)
            for (let tr of update.transactions) {
                if (getUserEvent(tr) == "input")
                    this.composing = 2 /* Changed */;
                else if (this.composing == 2 /* Changed */ && tr.selection)
                    this.composing = 3 /* ChangedAndMoved */;
            }
    }
    startUpdate() {
        this.debounceUpdate = -1;
        let { state } = this.view, cState = state.field(state_completionState);
        for (let active of cState.active) {
            if (active.state == 1 /* Pending */ && !this.running.some(r => r.active.source == active.source))
                this.startQuery(active);
        }
    }
    startQuery(active) {
        let { state } = this.view, pos = cur(state);
        let context = new CompletionContext(state, pos, active.explicitPos == pos);
        let pending = new RunningQuery(active, context);
        this.running.push(pending);
        Promise.resolve(active.source(context)).then(result => {
            if (!pending.context.aborted) {
                pending.done = result || null;
                this.scheduleAccept();
            }
        }, err => {
            this.view.dispatch({ effects: closeCompletionEffect.of(null) });
            (0,extension/* logException */.OO)(this.view.state, err);
        });
    }
    scheduleAccept() {
        if (this.running.every(q => q.done !== undefined))
            this.accept();
        else if (this.debounceAccept < 0)
            this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
    }
    // For each finished query in this.running, try to create a result or, if appropriate, restart the query.
    accept() {
        var _a;
        if (this.debounceAccept > -1)
            clearTimeout(this.debounceAccept);
        this.debounceAccept = -1;
        let updated = [];
        let conf = this.view.state.facet(completionConfig);
        for (let i = 0; i < this.running.length; i++) {
            let query = this.running[i];
            if (query.done === undefined)
                continue;
            this.running.splice(i--, 1);
            if (query.done) {
                let active = new ActiveResult(query.active.source, query.active.explicitPos, query.done, query.done.from, (_a = query.done.to) !== null && _a !== void 0 ? _a : cur(query.updates.length ? query.updates[0].startState : this.view.state));
                // Replay the transactions that happened since the start of the request and see if that preserves the result
                for (let tr of query.updates)
                    active = active.update(tr, conf);
                if (active.hasResult()) {
                    updated.push(active);
                    continue;
                }
            }
            let current = this.view.state.field(state_completionState).active.find(a => a.source == query.active.source);
            if (current && current.state == 1 /* Pending */) {
                if (query.done == null) {
                    // Explicitly failed. Should clear the pending status if it hasn't been re-set in the meantime.
                    let active = new ActiveSource(query.active.source, 0 /* Inactive */);
                    for (let tr of query.updates)
                        active = active.update(tr, conf);
                    if (active.state != 1 /* Pending */)
                        updated.push(active);
                }
                else {
                    // Cleared by subsequent transactions. Restart.
                    this.startQuery(current);
                }
            }
        }
        if (updated.length)
            this.view.dispatch({ effects: setActiveEffect.of(updated) });
    }
}, {
    eventHandlers: {
        compositionstart() {
            this.composing = 1 /* Started */;
        },
        compositionend() {
            if (this.composing == 3 /* ChangedAndMoved */) {
                // Safari fires compositionend events synchronously, possibly from inside an update, so dispatch asynchronously to avoid reentrancy
                setTimeout(() => this.view.dispatch({ effects: startCompletionEffect.of(false) }), 20);
            }
            this.composing = 0 /* None */;
        }
    }
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/theme.js

const theme_baseTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-tooltip.cm-tooltip-autocomplete": {
        "& > ul": {
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            overflow: "hidden auto",
            maxWidth_fallback: "700px",
            maxWidth: "min(700px, 95vw)",
            minWidth: "250px",
            maxHeight: "10em",
            listStyle: "none",
            margin: 0,
            padding: 0,
            "& > li": {
                overflowX: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                padding: "1px 3px",
                lineHeight: 1.2
            },
        }
    },
    "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
        background: "#17c",
        color: "white",
    },
    "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
        background: "#347",
        color: "white",
    },
    ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
        content: '"···"',
        opacity: 0.5,
        display: "block",
        textAlign: "center"
    },
    ".cm-tooltip.cm-completionInfo": {
        position: "absolute",
        padding: "3px 9px",
        width: "max-content",
        maxWidth: "300px",
    },
    ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
    ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
    "&light .cm-snippetField": { backgroundColor: "#00000022" },
    "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
    ".cm-snippetFieldPosition": {
        verticalAlign: "text-top",
        width: 0,
        height: "1.15em",
        margin: "0 -0.7px -.7em",
        borderLeft: "1.4px dotted #888"
    },
    ".cm-completionMatchedText": {
        textDecoration: "underline"
    },
    ".cm-completionDetail": {
        marginLeft: "0.5em",
        fontStyle: "italic"
    },
    ".cm-completionIcon": {
        fontSize: "90%",
        width: ".8em",
        display: "inline-block",
        textAlign: "center",
        paddingRight: ".6em",
        opacity: "0.6"
    },
    ".cm-completionIcon-function, .cm-completionIcon-method": {
        "&:after": { content: "'ƒ'" }
    },
    ".cm-completionIcon-class": {
        "&:after": { content: "'○'" }
    },
    ".cm-completionIcon-interface": {
        "&:after": { content: "'◌'" }
    },
    ".cm-completionIcon-variable": {
        "&:after": { content: "'𝑥'" }
    },
    ".cm-completionIcon-constant": {
        "&:after": { content: "'𝐶'" }
    },
    ".cm-completionIcon-type": {
        "&:after": { content: "'𝑡'" }
    },
    ".cm-completionIcon-enum": {
        "&:after": { content: "'∪'" }
    },
    ".cm-completionIcon-property": {
        "&:after": { content: "'□'" }
    },
    ".cm-completionIcon-keyword": {
        "&:after": { content: "'🔑\uFE0E'" } // Disable emoji rendering
    },
    ".cm-completionIcon-namespace": {
        "&:after": { content: "'▢'" }
    },
    ".cm-completionIcon-text": {
        "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
    }
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/snippet.js




class FieldPos {
    constructor(field, line, from, to) {
        this.field = field;
        this.line = line;
        this.from = from;
        this.to = to;
    }
}
class FieldRange {
    constructor(field, from, to) {
        this.field = field;
        this.from = from;
        this.to = to;
    }
    map(changes) {
        let from = changes.mapPos(this.from, -1, dist_state/* MapMode.TrackDel */.gc.TrackDel);
        let to = changes.mapPos(this.to, 1, dist_state/* MapMode.TrackDel */.gc.TrackDel);
        return from == null || to == null ? null : new FieldRange(this.field, from, to);
    }
}
class Snippet {
    constructor(lines, fieldPositions) {
        this.lines = lines;
        this.fieldPositions = fieldPositions;
    }
    instantiate(state, pos) {
        let text = [], lineStart = [pos];
        let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)[0];
        for (let line of this.lines) {
            if (text.length) {
                let indent = baseIndent, tabs = /^\t*/.exec(line)[0].length;
                for (let i = 0; i < tabs; i++)
                    indent += state.facet(indentUnit);
                lineStart.push(pos + indent.length - tabs);
                line = indent + line.slice(tabs);
            }
            text.push(line);
            pos += line.length + 1;
        }
        let ranges = this.fieldPositions.map(pos => new FieldRange(pos.field, lineStart[pos.line] + pos.from, lineStart[pos.line] + pos.to));
        return { text, ranges };
    }
    static parse(template) {
        let fields = [];
        let lines = [], positions = [], m;
        for (let line of template.split(/\r\n?|\n/)) {
            while (m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line)) {
                let seq = m[1] ? +m[1] : null, name = m[2] || m[3] || "", found = -1;
                for (let i = 0; i < fields.length; i++) {
                    if (seq != null ? fields[i].seq == seq : name ? fields[i].name == name : false)
                        found = i;
                }
                if (found < 0) {
                    let i = 0;
                    while (i < fields.length && (seq == null || (fields[i].seq != null && fields[i].seq < seq)))
                        i++;
                    fields.splice(i, 0, { seq, name });
                    found = i;
                    for (let pos of positions)
                        if (pos.field >= found)
                            pos.field++;
                }
                positions.push(new FieldPos(found, lines.length, m.index, m.index + name.length));
                line = line.slice(0, m.index) + name + line.slice(m.index + m[0].length);
            }
            lines.push(line);
        }
        return new Snippet(lines, positions);
    }
}
let fieldMarker = decoration/* Decoration.widget */.p.widget({ widget: new class extends decoration/* WidgetType */.l9 {
        toDOM() {
            let span = document.createElement("span");
            span.className = "cm-snippetFieldPosition";
            return span;
        }
        ignoreEvent() { return false; }
    } });
let fieldRange = decoration/* Decoration.mark */.p.mark({ class: "cm-snippetField" });
class ActiveSnippet {
    constructor(ranges, active) {
        this.ranges = ranges;
        this.active = active;
        this.deco = decoration/* Decoration.set */.p.set(ranges.map(r => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
    }
    map(changes) {
        let ranges = [];
        for (let r of this.ranges) {
            let mapped = r.map(changes);
            if (!mapped)
                return null;
            ranges.push(mapped);
        }
        return new ActiveSnippet(ranges, this.active);
    }
    selectionInsideField(sel) {
        return sel.ranges.every(range => this.ranges.some(r => r.field == this.active && r.from <= range.from && r.to >= range.to));
    }
}
const setActive = dist_state/* StateEffect.define */.Py.define({
    map(value, changes) { return value && value.map(changes); }
});
const moveToField = dist_state/* StateEffect.define */.Py.define();
const snippetState = dist_state/* StateField.define */.QQ.define({
    create() { return null; },
    update(value, tr) {
        for (let effect of tr.effects) {
            if (effect.is(setActive))
                return effect.value;
            if (effect.is(moveToField) && value)
                return new ActiveSnippet(value.ranges, effect.value);
        }
        if (value && tr.docChanged)
            value = value.map(tr.changes);
        if (value && tr.selection && !value.selectionInsideField(tr.selection))
            value = null;
        return value;
    },
    provide: f => editorview/* EditorView.decorations.from */.t.decorations.from(f, val => val ? val.deco : decoration/* Decoration.none */.p.none)
});
function fieldSelection(ranges, field) {
    return dist_state/* EditorSelection.create */.jT.create(ranges.filter(r => r.field == field).map(r => dist_state/* EditorSelection.range */.jT.range(r.from, r.to)));
}
/**
 *  Convert a snippet template to a function that can [apply]{@link Completion.apply} it.
 *  Snippets are written using syntax like this:
 *  @example
 *    "for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"
 */
function snippet(template) {
    let snippet = Snippet.parse(template);
    return (editor, _completion, from, to) => {
        let { text, ranges } = snippet.instantiate(editor.state, from);
        let spec = { changes: { from, to, insert: dist_state/* Text.of */.xv.of(text) } };
        if (ranges.length)
            spec.selection = fieldSelection(ranges, 0);
        if (ranges.length > 1) {
            let active = new ActiveSnippet(ranges, 0);
            let effects = spec.effects = [setActive.of(active)];
            if (editor.state.field(snippetState, false) === undefined)
                effects.push(dist_state/* StateEffect.appendConfig.of */.Py.appendConfig.of([snippetState, addSnippetKeymap, snippetPointerHandler, theme_baseTheme]));
        }
        editor.dispatch(editor.state.update(spec));
    };
}
function moveField(dir) {
    return ({ state, dispatch }) => {
        let active = state.field(snippetState, false);
        if (!active || dir < 0 && active.active == 0)
            return false;
        let next = active.active + dir, last = dir > 0 && !active.ranges.some(r => r.field == next + dir);
        dispatch(state.update({
            selection: fieldSelection(active.ranges, next),
            effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
        }));
        return true;
    };
}
/** A command that clears the active snippet, if any. */
const clearSnippet = ({ state, dispatch }) => {
    let active = state.field(snippetState, false);
    if (!active)
        return false;
    dispatch(state.update({ effects: setActive.of(null) }));
    return true;
};
/** Move to the next snippet field, if available. */
const nextSnippetField = moveField(1);
/** Move to the previous snippet field, if available. */
const prevSnippetField = moveField(-1);
const defaultSnippetKeymap = [
    { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
    { key: "Escape", run: clearSnippet }
];
/** A facet that can be used to configure the key bindings used by snippets. */
const snippetKeymap = dist_state/* Facet.define */.r$.define({
    combine(maps) { return maps.length ? maps[0] : defaultSnippetKeymap; }
});
const addSnippetKeymap = dist_state/* Prec.highest */.Wl.highest(keymap.compute([snippetKeymap], state => state.facet(snippetKeymap)));
/** Create a completion from a snippet. */
function snippetCompletion(template, completion) {
    return Object.assign(Object.assign({}, completion), { apply: snippet(template) });
}
const snippetPointerHandler = editorview/* EditorView.domEventHandlers */.t.domEventHandlers({
    mousedown(event, view) {
        let active = view.state.field(snippetState, false), pos;
        if (!active || (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) == null)
            return false;
        let match = active.ranges.find(r => r.from <= pos && r.to >= pos);
        if (!match || match.field == active.active)
            return false;
        view.dispatch({
            selection: fieldSelection(active.ranges, match.field),
            effects: setActive.of(active.ranges.some(r => r.field > match.field) ? new ActiveSnippet(active.ranges, match.field) : null)
        });
        return true;
    }
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/word.js
function wordRE(wordChars) {
    let escaped = wordChars.replace(/[\\[.+*?(){|^$]/g, "\\$&");
    try {
        return new RegExp(`[\\p{Alphabetic}\\p{Number}_${escaped}]+`, "ug");
    }
    catch (_a) {
        return new RegExp(`[\w${escaped}]`, "g");
    }
}
function mapRE(re, f) {
    return new RegExp(f(re.source), re.unicode ? "u" : "");
}
const wordCaches = Object.create(null);
function wordCache(wordChars) {
    return wordCaches[wordChars] || (wordCaches[wordChars] = new WeakMap);
}
function storeWords(doc, wordRE, result, seen, ignoreAt) {
    for (let lines = doc.iterLines(), pos = 0; !lines.next().done;) {
        let { value } = lines, m;
        wordRE.lastIndex = 0;
        while (m = wordRE.exec(value)) {
            if (!seen[m[0]] && pos + m.index != ignoreAt) {
                result.push({ type: "text", label: m[0] });
                seen[m[0]] = true;
                if (result.length >= 2000 /* MaxList */)
                    return;
            }
        }
        pos += value.length + 1;
    }
}
function collectWords(doc, cache, wordRE, to, ignoreAt) {
    let big = doc.length >= 1000 /* MinCacheLen */;
    let cached = big && cache.get(doc);
    if (cached)
        return cached;
    let result = [], seen = Object.create(null);
    if (doc.children) {
        let pos = 0;
        for (let ch of doc.children) {
            if (ch.length >= 1000 /* MinCacheLen */) {
                for (let c of collectWords(ch, cache, wordRE, to - pos, ignoreAt - pos)) {
                    if (!seen[c.label]) {
                        seen[c.label] = true;
                        result.push(c);
                    }
                }
            }
            else {
                storeWords(ch, wordRE, result, seen, ignoreAt - pos);
            }
            pos += ch.length + 1;
        }
    }
    else {
        storeWords(doc, wordRE, result, seen, ignoreAt);
    }
    if (big && result.length < 2000 /* MaxList */)
        cache.set(doc, result);
    return result;
}
/**
 *  A completion source that will scan the document for words (using a [character categorizer]{@link charCategorizer}),
 *  and return those as completions.
 */
const completeAnyWord = context => {
    let wordChars = context.state.languageDataAt("wordChars", context.pos).join("");
    let re = wordRE(wordChars);
    let token = context.matchBefore(mapRE(re, s => s + "$"));
    if (!token && !context.explicit)
        return null;
    let from = token ? token.from : context.pos;
    let options = collectWords(context.state.doc, wordCache(wordChars), re, 50000 /* Range */, from);
    return { from, options, validFor: mapRE(re, s => "^" + s) };
};

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/closebrackets.js



const closebrackets_defaults = {
    brackets: ["(", "[", "{", "'", '"'],
    before: ")]}:;>"
};
const closeBracketEffect = dist_state/* StateEffect.define */.Py.define({
    map(value, mapping) {
        let mapped = mapping.mapPos(value, -1, dist_state/* MapMode.TrackAfter */.gc.TrackAfter);
        return mapped == null ? undefined : mapped;
    }
});
const skipBracketEffect = dist_state/* StateEffect.define */.Py.define({
    map(value, mapping) { return mapping.mapPos(value); }
});
const closedBracket = new class extends dist_state/* RangeValue */.uU {
};
closedBracket.startSide = 1;
closedBracket.endSide = -1;
const bracketState = dist_state/* StateField.define */.QQ.define({
    create() { return dist_state/* RangeSet.empty */.Xs.empty; },
    update(value, tr) {
        if (tr.selection) {
            let lineStart = tr.state.doc.lineAt(tr.selection.main.head).from;
            let prevLineStart = tr.startState.doc.lineAt(tr.startState.selection.main.head).from;
            if (lineStart != tr.changes.mapPos(prevLineStart, -1))
                value = dist_state/* RangeSet.empty */.Xs.empty;
        }
        value = value.map(tr.changes);
        for (let effect of tr.effects) {
            if (effect.is(closeBracketEffect))
                value = value.update({ add: [closedBracket.range(effect.value, effect.value + 1)] });
            else if (effect.is(skipBracketEffect))
                value = value.update({ filter: from => from != effect.value });
        }
        return value;
    }
});
function closeBrackets() {
    return [inputHandler, bracketState];
}
const definedClosing = "()[]{}<>";
function closing(ch) {
    for (let i = 0; i < definedClosing.length; i += 2)
        if (definedClosing.charCodeAt(i) == ch)
            return definedClosing.charAt(i + 1);
    return (0,dist_state/* fromCodePoint */.bg)(ch < 128 ? ch : ch + 1);
}
function config(state, pos) {
    return state.languageDataAt("closeBrackets", pos)[0] || closebrackets_defaults;
}
const android = typeof navigator == "object" && /Android\b/.test(navigator.userAgent);
const inputHandler = editorview/* EditorView.inputHandler.of */.t.inputHandler.of((view, from, to, insert) => {
    if ((android ? view.composing : view.compositionStarted) || view.state.readOnly)
        return false;
    let sel = view.state.selection.main;
    if (insert.length > 2 || insert.length == 2 && (0,dist_state/* codePointSize */.nZ)((0,dist_state/* codePointAt */.gm)(insert, 0)) == 1 ||
        from != sel.from || to != sel.to)
        return false;
    let tr = insertBracket(view.state, insert);
    if (!tr)
        return false;
    view.dispatch(tr);
    return true;
});
/** Command that implements deleting a pair of matching brackets when the cursor is between them. */
const deleteBracketPair = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let conf = config(state, state.selection.main.head);
    let tokens = conf.brackets || closebrackets_defaults.brackets;
    let dont = null, changes = state.changeByRange(range => {
        if (range.empty) {
            let before = prevChar(state.doc, range.head);
            for (let token of tokens) {
                if (token == before && nextChar(state.doc, range.head) == closing((0,dist_state/* codePointAt */.gm)(token, 0)))
                    return { changes: { from: range.head - token.length, to: range.head + token.length },
                        range: dist_state/* EditorSelection.cursor */.jT.cursor(range.head - token.length),
                        userEvent: "delete.backward" };
            }
        }
        return { range: dont = range };
    });
    if (!dont)
        dispatch(state.update(changes, { scrollIntoView: true }));
    return !dont;
};
/** Close-brackets related key bindings. Binds Backspace to {@link deleteBracketPair}. */
const closeBracketsKeymap = [
    { key: "Backspace", run: deleteBracketPair }
];
function insertBracket(state, bracket) {
    let conf = config(state, state.selection.main.head);
    let tokens = conf.brackets || closebrackets_defaults.brackets;
    for (let tok of tokens) {
        let closed = closing((0,dist_state/* codePointAt */.gm)(tok, 0));
        if (bracket == tok)
            return closed == tok ? handleSame(state, tok, tokens.indexOf(tok + tok + tok) > -1)
                : handleOpen(state, tok, closed, conf.before || closebrackets_defaults.before);
        if (bracket == closed && closedBracketAt(state, state.selection.main.from))
            return handleClose(state, tok, closed);
    }
    return null;
}
function closedBracketAt(state, pos) {
    let found = false;
    state.field(bracketState).between(0, state.doc.length, from => {
        if (from == pos)
            found = true;
    });
    return found;
}
function nextChar(doc, pos) {
    let next = doc.sliceString(pos, pos + 2);
    return next.slice(0, (0,dist_state/* codePointSize */.nZ)((0,dist_state/* codePointAt */.gm)(next, 0)));
}
function prevChar(doc, pos) {
    let prev = doc.sliceString(pos - 2, pos);
    return (0,dist_state/* codePointSize */.nZ)((0,dist_state/* codePointAt */.gm)(prev, 0)) == prev.length ? prev : prev.slice(1);
}
function handleOpen(state, open, close, closeBefore) {
    let dont = null, changes = state.changeByRange(range => {
        if (!range.empty)
            return { changes: [{ insert: open, from: range.from }, { insert: close, from: range.to }],
                effects: closeBracketEffect.of(range.to + open.length),
                range: dist_state/* EditorSelection.range */.jT.range(range.anchor + open.length, range.head + open.length) };
        let next = nextChar(state.doc, range.head);
        if (!next || /\s/.test(next) || closeBefore.indexOf(next) > -1)
            return { changes: { insert: open + close, from: range.head },
                effects: closeBracketEffect.of(range.head + open.length),
                range: dist_state/* EditorSelection.cursor */.jT.cursor(range.head + open.length) };
        return { range: dont = range };
    });
    return dont ? null : state.update(changes, {
        scrollIntoView: true,
        userEvent: "input.type"
    });
}
function handleClose(state, _open, close) {
    let dont = null, moved = state.selection.ranges.map(range => {
        if (range.empty && nextChar(state.doc, range.head) == close)
            return dist_state/* EditorSelection.cursor */.jT.cursor(range.head + close.length);
        return dont = range;
    });
    return dont ? null : state.update({
        selection: dist_state/* EditorSelection.create */.jT.create(moved, state.selection.mainIndex),
        scrollIntoView: true,
        effects: state.selection.ranges.map(({ from }) => skipBracketEffect.of(from))
    });
}
function handleSame(state, token, allowTriple) {
    let dont = null, changes = state.changeByRange(range => {
        if (!range.empty)
            return { changes: [{ insert: token, from: range.from }, { insert: token, from: range.to }],
                effects: closeBracketEffect.of(range.to + token.length),
                range: dist_state/* EditorSelection.range */.jT.range(range.anchor + token.length, range.head + token.length) };
        let pos = range.head, next = nextChar(state.doc, pos);
        if (next == token) {
            if (nodeStart(state, pos)) {
                return { changes: { insert: token + token, from: pos },
                    effects: closeBracketEffect.of(pos + token.length),
                    range: dist_state/* EditorSelection.cursor */.jT.cursor(pos + token.length) };
            }
            else if (closedBracketAt(state, pos)) {
                let isTriple = allowTriple && state.sliceDoc(pos, pos + token.length * 3) == token + token + token;
                return { range: dist_state/* EditorSelection.cursor */.jT.cursor(pos + token.length * (isTriple ? 3 : 1)),
                    effects: skipBracketEffect.of(pos) };
            }
        }
        else if (allowTriple && state.sliceDoc(pos - 2 * token.length, pos) == token + token &&
            nodeStart(state, pos - 2 * token.length)) {
            return { changes: { insert: token + token + token + token, from: pos },
                effects: closeBracketEffect.of(pos + token.length),
                range: dist_state/* EditorSelection.cursor */.jT.cursor(pos + token.length) };
        }
        else if (state.charCategorizer(pos)(next) != dist_state/* CharCategory.Word */.D0.Word) {
            let prev = state.sliceDoc(pos - 1, pos);
            if (prev != token && state.charCategorizer(pos)(prev) != dist_state/* CharCategory.Word */.D0.Word && !probablyInString(state, pos, token))
                return { changes: { insert: token + token, from: pos },
                    effects: closeBracketEffect.of(pos + token.length),
                    range: dist_state/* EditorSelection.cursor */.jT.cursor(pos + token.length) };
        }
        return { range: dont = range };
    });
    return dont ? null : state.update(changes, {
        scrollIntoView: true,
        userEvent: "input.type"
    });
}
function nodeStart(state, pos) {
    let tree = language_syntaxTree(state).resolveInner(pos + 1);
    return tree.parent && tree.from == pos;
}
function probablyInString(state, pos, quoteToken) {
    let node = language_syntaxTree(state).resolveInner(pos, -1);
    for (let i = 0; i < 5; i++) {
        if (state.sliceDoc(node.from, node.from + quoteToken.length) == quoteToken)
            return true;
        let parent = node.to == pos && node.parent;
        if (!parent)
            break;
        node = parent;
    }
    return false;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/autocomplete/index.js











/** @return Returns an extension that enables autocompletion. */
function autocompletion(config = {}) {
    return [
        state_completionState,
        completionConfig.of(config),
        completionPlugin,
        completionKeymapExt,
        theme_baseTheme
    ];
}
/**
 * Basic keybindings for autocompletion.
 *
 *  - Ctrl-Space: {@link startCompletion}
 *  - Escape: {@link closeCompletion}
 *  - ArrowDown: {@link moveCompletionSelection}`(true)`
 *  - ArrowUp: {@link moveCompletionSelection}`(false)`
 *  - PageDown: {@link moveCompletionSelection}`(true, "page")`
 *  - PageDown: {@link moveCompletionSelection}`(true, "page")`
 *  - Enter: {@link acceptCompletion}
 */
const completionKeymap = [
    { key: "Ctrl-Space", run: startCompletion },
    { key: "Escape", run: closeCompletion },
    { key: "ArrowDown", run: moveCompletionSelection(true) },
    { key: "ArrowUp", run: moveCompletionSelection(false) },
    { key: "PageDown", run: moveCompletionSelection(true, "page") },
    { key: "PageUp", run: moveCompletionSelection(false, "page") },
    { key: "Enter", run: acceptCompletion }
];
const completionKeymapExt = dist_state/* Prec.highest */.Wl.highest(keymap.computeN([completionConfig], state => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));
/**
 * Get the current completion status.
 *
 * @return When completions are available, this will return `"active"`.
 *         When completions are pending (in the process of being queried), this returns `"pending"`. Otherwise, it returns `null`.
 */
function completionStatus(state) {
    let cState = state.field(completionState, false);
    return cState && cState.active.some(a => a.state == 1 /* Pending */) ? "pending" :
        cState && cState.active.some(a => a.state != 0 /* Inactive */) ? "active" : null;
}
const completionArrayCache = new WeakMap;
/** Returns the available completions as an array. */
function currentCompletions(state) {
    var _a;
    let open = (_a = state.field(completionState, false)) === null || _a === void 0 ? void 0 : _a.open;
    if (!open)
        return [];
    let completions = completionArrayCache.get(open.options);
    if (!completions)
        completionArrayCache.set(open.options, completions = open.options.map(o => o.completion));
    return completions;
}
/** Return the currently selected completion, if any. */
function selectedCompletion(state) {
    var _a;
    let open = (_a = state.field(completionState, false)) === null || _a === void 0 ? void 0 : _a.open;
    return open ? open.options[open.selected].completion : null;
}
/** Returns the currently selected position in the active completion list, or null if no completions are active. */
function selectedCompletionIndex(state) {
    var _a;
    let open = (_a = state.field(completionState, false)) === null || _a === void 0 ? void 0 : _a.open;
    return open ? open.selected : null;
}
/** Create an effect that can be attached to a transaction to change the currently selected completion. */
function setSelectedCompletion(index) {
    return setSelectedEffect.of(index);
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lint/lint.js



class SelectedDiagnostic {
    constructor(from, to, diagnostic) {
        this.from = from;
        this.to = to;
        this.diagnostic = diagnostic;
    }
}
class LintState {
    constructor(diagnostics, panel, selected) {
        this.diagnostics = diagnostics;
        this.panel = panel;
        this.selected = selected;
    }
    static init(diagnostics, panel, state) {
        let ranges = decoration/* Decoration.set */.p.set(diagnostics.map((d) => {
            // For zero-length ranges or ranges covering only a line break, create a widget
            return d.from == d.to || (d.from == d.to - 1 && state.doc.lineAt(d.from).to == d.from)
                ? decoration/* Decoration.widget */.p.widget({
                    widget: new DiagnosticWidget(d),
                    diagnostic: d
                }).range(d.from)
                : decoration/* Decoration.mark */.p.mark({
                    attributes: { class: "cm-lintRange cm-lintRange-" + d.severity },
                    diagnostic: d
                }).range(d.from, d.to);
        }), true);
        return new LintState(ranges, panel, findDiagnostic(ranges));
    }
}
function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
    let found = null;
    diagnostics.between(after, 1e9, (from, to, { spec }) => {
        if (diagnostic && spec.diagnostic != diagnostic)
            return;
        found = new SelectedDiagnostic(from, to, spec.diagnostic);
        return false;
    });
    return found;
}
function hideTooltip(tr, tooltip) {
    return !!(tr.effects.some(e => e.is(setDiagnosticsEffect)) || tr.changes.touchesRange(tooltip.pos));
}
function maybeEnableLint(state, effects) {
    return state.field(lintState, false) ? effects : effects.concat(dist_state/* StateEffect.appendConfig.of */.Py.appendConfig.of([
        lintState,
        editorview/* EditorView.decorations.compute */.t.decorations.compute([lintState], state => {
            let { selected, panel } = state.field(lintState);
            return !selected || !panel || selected.from == selected.to ? decoration/* Decoration.none */.p.none : decoration/* Decoration.set */.p.set([
                activeMark.range(selected.from, selected.to)
            ]);
        }),
        hoverTooltip(lintTooltip, { hideOn: hideTooltip }),
        lint_baseTheme
    ]));
}
/** Returns a transaction spec which updates the current set of diagnostics, and enables the lint extension if if wasn't already active. */
function setDiagnostics(state, diagnostics) {
    return {
        effects: maybeEnableLint(state, [setDiagnosticsEffect.of(diagnostics)])
    };
}
/**
 * The state effect that updates the set of active diagnostics. Can
 * be useful when writing an extension that needs to track these.
 */
const setDiagnosticsEffect = dist_state/* StateEffect.define */.Py.define();
const lint_togglePanel = dist_state/* StateEffect.define */.Py.define();
const movePanelSelection = dist_state/* StateEffect.define */.Py.define();
const lintState = dist_state/* StateField.define */.QQ.define({
    create() {
        return new LintState(decoration/* Decoration.none */.p.none, null, null);
    },
    update(value, tr) {
        if (tr.docChanged) {
            let mapped = value.diagnostics.map(tr.changes), selected = null;
            if (value.selected) {
                let selPos = tr.changes.mapPos(value.selected.from, 1);
                selected = findDiagnostic(mapped, value.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
            }
            value = new LintState(mapped, value.panel, selected);
        }
        for (let effect of tr.effects) {
            if (effect.is(setDiagnosticsEffect)) {
                value = LintState.init(effect.value, value.panel, tr.state);
            }
            else if (effect.is(lint_togglePanel)) {
                value = new LintState(value.diagnostics, effect.value ? LintPanel.open : null, value.selected);
            }
            else if (effect.is(movePanelSelection)) {
                value = new LintState(value.diagnostics, value.panel, effect.value);
            }
        }
        return value;
    },
    provide: f => [view_panel/* showPanel.from */.mH.from(f, val => val.panel),
        editorview/* EditorView.decorations.from */.t.decorations.from(f, s => s.diagnostics)]
});
/** Returns the number of active lint diagnostics in the given state. */
function diagnosticCount(state) {
    let lint = state.field(lintState, false);
    return lint ? lint.diagnostics.size : 0;
}
const activeMark = decoration/* Decoration.mark */.p.mark({ class: "cm-lintRange cm-lintRange-active" });
function lintTooltip(view, pos, side) {
    let { diagnostics } = view.state.field(lintState);
    let found = [], stackStart = 2e8, stackEnd = 0;
    diagnostics.between(pos - (side < 0 ? 1 : 0), pos + (side > 0 ? 1 : 0), (from, to, { spec }) => {
        if (pos >= from && pos <= to &&
            (from == to || ((pos > from || side > 0) && (pos < to || side < 0)))) {
            found.push(spec.diagnostic);
            stackStart = Math.min(from, stackStart);
            stackEnd = Math.max(to, stackEnd);
        }
    });
    if (!found.length)
        return null;
    return {
        pos: stackStart,
        end: stackEnd,
        above: view.state.doc.lineAt(stackStart).to < stackEnd,
        create() {
            return { dom: diagnosticsTooltip(view, found) };
        }
    };
}
function diagnosticsTooltip(view, diagnostics) {
    return crelt("ul", { class: "cm-tooltip-lint" }, diagnostics.map(d => renderDiagnostic(view, d, false)));
}
/** Command to open and focus the lint panel. */
const openLintPanel = (view) => {
    let field = view.state.field(lintState, false);
    if (!field || !field.panel)
        view.dispatch({ effects: maybeEnableLint(view.state, [lint_togglePanel.of(true)]) });
    let panel = (0,view_panel/* getPanel */.Sd)(view, LintPanel.open);
    if (panel)
        panel.dom.querySelector(".cm-panel-lint ul").focus();
    return true;
};
/** Command to close the lint panel, when open. */
const closeLintPanel = (view) => {
    let field = view.state.field(lintState, false);
    if (!field || !field.panel)
        return false;
    view.dispatch({ effects: lint_togglePanel.of(false) });
    return true;
};
/** Move the selection to the next diagnostic. */
const nextDiagnostic = (view) => {
    let field = view.state.field(lintState, false);
    if (!field)
        return false;
    let sel = view.state.selection.main, next = field.diagnostics.iter(sel.to + 1);
    if (!next.value) {
        next = field.diagnostics.iter(0);
        if (!next.value || next.from == sel.from && next.to == sel.to)
            return false;
    }
    view.dispatch({ selection: { anchor: next.from, head: next.to }, scrollIntoView: true });
    return true;
};
/**
 *  A set of default key bindings for the lint functionality.
 *
 * - Ctrl-Shift-m (Cmd-Shift-m on macOS): {@link openLintPanel}
 * - F8: {@link nextDiagnostic}
 */
const lintKeymap = [
    { key: "Mod-Shift-m", run: openLintPanel },
    { key: "F8", run: nextDiagnostic }
];
const lintPlugin = extension/* ViewPlugin.fromClass */.lg.fromClass(class {
    constructor(view) {
        this.view = view;
        this.timeout = -1;
        this.set = true;
        let { delay } = view.state.facet(lintSource);
        this.lintTime = Date.now() + delay;
        this.run = this.run.bind(this);
        this.timeout = setTimeout(this.run, delay);
    }
    run() {
        let now = Date.now();
        if (now < this.lintTime - 10) {
            setTimeout(this.run, this.lintTime - now);
        }
        else {
            this.set = false;
            let { state } = this.view, { sources } = state.facet(lintSource);
            Promise.all(sources.map(source => Promise.resolve(source(this.view)))).then(annotations => {
                let all = annotations.reduce((a, b) => a.concat(b));
                if (this.view.state.doc == state.doc)
                    this.view.dispatch(setDiagnostics(this.view.state, all));
            }, error => { (0,extension/* logException */.OO)(this.view.state, error); });
        }
    }
    update(update) {
        let source = update.state.facet(lintSource);
        if (update.docChanged || source != update.startState.facet(lintSource)) {
            this.lintTime = Date.now() + source.delay;
            if (!this.set) {
                this.set = true;
                this.timeout = setTimeout(this.run, source.delay);
            }
        }
    }
    force() {
        if (this.set) {
            this.lintTime = Date.now();
            this.run();
        }
    }
    destroy() {
        clearTimeout(this.timeout);
    }
});
const lintSource = dist_state/* Facet.define */.r$.define({
    combine(input) {
        return { sources: input.map(i => i.source), delay: input.length ? Math.max(...input.map(i => i.delay)) : 750 };
    },
    enables: lintPlugin
});
/**
 *  Given a diagnostic source, this function returns an extension that
 *  enables linting with that source. It will be called whenever the
 *  editor is idle (after its content changed).
 */
function linter(source, config = {}) {
    var _a;
    return lintSource.of({ source, delay: (_a = config.delay) !== null && _a !== void 0 ? _a : 750 });
}
/** Forces any linters [configured]{@link linter} to run when the editor is idle to run right away. */
function forceLinting(view) {
    let plugin = view.plugin(lintPlugin);
    if (plugin)
        plugin.force();
}
function assignKeys(actions) {
    let assigned = [];
    if (actions)
        actions: for (let { name } of actions) {
            for (let i = 0; i < name.length; i++) {
                let ch = name[i];
                if (/[a-zA-Z]/.test(ch) && !assigned.some(c => c.toLowerCase() == ch.toLowerCase())) {
                    assigned.push(ch);
                    continue actions;
                }
            }
            assigned.push("");
        }
    return assigned;
}
function renderDiagnostic(view, diagnostic, inPanel) {
    var _a;
    let keys = inPanel ? assignKeys(diagnostic.actions) : [];
    return crelt("li", { class: "cm-diagnostic cm-diagnostic-" + diagnostic.severity }, crelt("span", { class: "cm-diagnosticText" }, diagnostic.message), (_a = diagnostic.actions) === null || _a === void 0 ? void 0 : _a.map((action, i) => {
        let click = (e) => {
            e.preventDefault();
            let found = findDiagnostic(view.state.field(lintState).diagnostics, diagnostic);
            if (found)
                action.apply(view, found.from, found.to);
        };
        let { name } = action, keyIndex = keys[i] ? name.indexOf(keys[i]) : -1;
        let nameElt = keyIndex < 0 ? name : [name.slice(0, keyIndex),
            crelt("u", name.slice(keyIndex, keyIndex + 1)),
            name.slice(keyIndex + 1)];
        return crelt("button", {
            type: "button",
            class: "cm-diagnosticAction",
            onclick: click,
            onmousedown: click,
            "aria-label": ` Action: ${name}${keyIndex < 0 ? "" : ` (access key "${keys[i]})"`}.`
        }, nameElt);
    }), diagnostic.source && crelt("div", { class: "cm-diagnosticSource" }, diagnostic.source));
}
class DiagnosticWidget extends decoration/* WidgetType */.l9 {
    constructor(diagnostic) {
        super();
        this.diagnostic = diagnostic;
    }
    eq(other) { return other.diagnostic == this.diagnostic; }
    toDOM() {
        return crelt("span", { class: "cm-lintPoint cm-lintPoint-" + this.diagnostic.severity });
    }
}
class PanelItem {
    constructor(view, diagnostic) {
        this.diagnostic = diagnostic;
        this.id = "item_" + Math.floor(Math.random() * 0xffffffff).toString(16);
        this.dom = renderDiagnostic(view, diagnostic, true);
        this.dom.id = this.id;
        this.dom.setAttribute("role", "option");
    }
}
class LintPanel {
    constructor(view) {
        this.view = view;
        this.items = [];
        let onkeydown = (event) => {
            if (event.keyCode == 27) { // Escape
                closeLintPanel(this.view);
                this.view.focus();
            }
            else if (event.keyCode == 38 || event.keyCode == 33) { // ArrowUp, PageUp
                this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
            }
            else if (event.keyCode == 40 || event.keyCode == 34) { // ArrowDown, PageDown
                this.moveSelection((this.selectedIndex + 1) % this.items.length);
            }
            else if (event.keyCode == 36) { // Home
                this.moveSelection(0);
            }
            else if (event.keyCode == 35) { // End
                this.moveSelection(this.items.length - 1);
            }
            else if (event.keyCode == 13) { // Enter
                this.view.focus();
            }
            else if (event.keyCode >= 65 && event.keyCode <= 90 && this.selectedIndex >= 0) { // A-Z
                let { diagnostic } = this.items[this.selectedIndex], keys = assignKeys(diagnostic.actions);
                for (let i = 0; i < keys.length; i++)
                    if (keys[i].toUpperCase().charCodeAt(0) == event.keyCode) {
                        let found = findDiagnostic(this.view.state.field(lintState).diagnostics, diagnostic);
                        if (found)
                            diagnostic.actions[i].apply(view, found.from, found.to);
                    }
            }
            else {
                return;
            }
            event.preventDefault();
        };
        let onclick = (event) => {
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].dom.contains(event.target))
                    this.moveSelection(i);
            }
        };
        this.list = crelt("ul", {
            tabIndex: 0,
            role: "listbox",
            "aria-label": this.view.state.phrase("Diagnostics"),
            onkeydown,
            onclick
        });
        this.dom = crelt("div", { class: "cm-panel-lint" }, this.list, crelt("button", {
            type: "button",
            name: "close",
            "aria-label": this.view.state.phrase("close"),
            onclick: () => closeLintPanel(this.view)
        }, "×"));
        this.update();
    }
    get selectedIndex() {
        let selected = this.view.state.field(lintState).selected;
        if (!selected)
            return -1;
        for (let i = 0; i < this.items.length; i++)
            if (this.items[i].diagnostic == selected.diagnostic)
                return i;
        return -1;
    }
    update() {
        let { diagnostics, selected } = this.view.state.field(lintState);
        let i = 0, needsSync = false, newSelectedItem = null;
        diagnostics.between(0, this.view.state.doc.length, (_start, _end, { spec }) => {
            let found = -1, item;
            for (let j = i; j < this.items.length; j++)
                if (this.items[j].diagnostic == spec.diagnostic) {
                    found = j;
                    break;
                }
            if (found < 0) {
                item = new PanelItem(this.view, spec.diagnostic);
                this.items.splice(i, 0, item);
                needsSync = true;
            }
            else {
                item = this.items[found];
                if (found > i) {
                    this.items.splice(i, found - i);
                    needsSync = true;
                }
            }
            if (selected && item.diagnostic == selected.diagnostic) {
                if (!item.dom.hasAttribute("aria-selected")) {
                    item.dom.setAttribute("aria-selected", "true");
                    newSelectedItem = item;
                }
            }
            else if (item.dom.hasAttribute("aria-selected")) {
                item.dom.removeAttribute("aria-selected");
            }
            i++;
        });
        while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
            needsSync = true;
            this.items.pop();
        }
        if (this.items.length == 0) {
            this.items.push(new PanelItem(this.view, {
                from: -1, to: -1,
                severity: "info",
                message: this.view.state.phrase("No diagnostics")
            }));
            needsSync = true;
        }
        if (newSelectedItem) {
            this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
            this.view.requestMeasure({
                key: this,
                read: () => ({ sel: newSelectedItem.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
                write: ({ sel, panel }) => {
                    if (sel.top < panel.top)
                        this.list.scrollTop -= panel.top - sel.top;
                    else if (sel.bottom > panel.bottom)
                        this.list.scrollTop += sel.bottom - panel.bottom;
                }
            });
        }
        else if (this.selectedIndex < 0) {
            this.list.removeAttribute("aria-activedescendant");
        }
        if (needsSync)
            this.sync();
    }
    sync() {
        let domPos = this.list.firstChild;
        function rm() {
            let prev = domPos;
            domPos = prev.nextSibling;
            prev.remove();
        }
        for (let item of this.items) {
            if (item.dom.parentNode == this.list) {
                while (domPos != item.dom)
                    rm();
                domPos = item.dom.nextSibling;
            }
            else {
                this.list.insertBefore(item.dom, domPos);
            }
        }
        while (domPos)
            rm();
    }
    moveSelection(selectedIndex) {
        if (this.selectedIndex < 0)
            return;
        let field = this.view.state.field(lintState);
        let selection = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
        if (!selection)
            return;
        this.view.dispatch({
            selection: { anchor: selection.from, head: selection.to },
            scrollIntoView: true,
            effects: movePanelSelection.of(selection)
        });
    }
    static open(view) { return new LintPanel(view); }
}
function svg(content, attrs = `viewBox="0 0 40 40"`) {
    return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content)}</svg>')`;
}
function underline(color) {
    return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`, `width="6" height="3"`);
}
const lint_baseTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-diagnostic": {
        padding: "3px 6px 3px 8px",
        marginLeft: "-1px",
        display: "block",
        whiteSpace: "pre-wrap"
    },
    ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
    ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
    ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
    ".cm-diagnosticAction": {
        font: "inherit",
        border: "none",
        padding: "2px 4px",
        backgroundColor: "#444",
        color: "white",
        borderRadius: "3px",
        marginLeft: "8px"
    },
    ".cm-diagnosticSource": {
        fontSize: "70%",
        opacity: .7
    },
    ".cm-lintRange": {
        backgroundPosition: "left bottom",
        backgroundRepeat: "repeat-x",
        paddingBottom: "0.7px",
    },
    ".cm-lintRange-error": { backgroundImage: underline("#d11") },
    ".cm-lintRange-warning": { backgroundImage: underline("orange") },
    ".cm-lintRange-info": { backgroundImage: underline("#999") },
    ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
    ".cm-tooltip-lint": {
        padding: 0,
        margin: 0
    },
    ".cm-lintPoint": {
        position: "relative",
        "&:after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "-2px",
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderBottom: "4px solid #d11"
        }
    },
    ".cm-lintPoint-warning": {
        "&:after": { borderBottomColor: "orange" }
    },
    ".cm-lintPoint-info": {
        "&:after": { borderBottomColor: "#999" }
    },
    ".cm-panel.cm-panel-lint": {
        position: "relative",
        "& ul": {
            maxHeight: "100px",
            overflowY: "auto",
            "& [aria-selected]": {
                backgroundColor: "#ddd",
                "& u": { textDecoration: "underline" }
            },
            "&:focus [aria-selected]": {
                background_fallback: "#bdf",
                backgroundColor: "Highlight",
                color_fallback: "white",
                color: "HighlightText"
            },
            "& u": { textDecoration: "none" },
            padding: 0,
            margin: 0
        },
        "& [name=close]": {
            position: "absolute",
            top: "0",
            right: "2px",
            background: "inherit",
            border: "none",
            font: "inherit",
            padding: 0,
            margin: 0
        }
    }
});
class LintGutterMarker extends GutterMarker {
    constructor(diagnostics) {
        super();
        this.diagnostics = diagnostics;
        this.severity = diagnostics.reduce((max, d) => {
            let s = d.severity;
            return s == "error" || s == "warning" && max == "info" ? s : max;
        }, "info");
    }
    toDOM(view) {
        let elt = document.createElement("div");
        elt.className = "cm-lint-marker cm-lint-marker-" + this.severity;
        elt.onmouseover = () => gutterMarkerMouseOver(view, elt, this.diagnostics);
        return elt;
    }
}
function trackHoverOn(view, marker) {
    let mousemove = (event) => {
        let rect = marker.getBoundingClientRect();
        if (event.clientX > rect.left - 10 /* Margin */ && event.clientX < rect.right + 10 /* Margin */ &&
            event.clientY > rect.top - 10 /* Margin */ && event.clientY < rect.bottom + 10 /* Margin */)
            return;
        for (let target = event.target; target; target = target.parentNode) {
            if (target.nodeType == 1 && target.classList.contains("cm-tooltip-lint"))
                return;
        }
        window.removeEventListener("mousemove", mousemove);
        if (view.state.field(lintGutterTooltip))
            view.dispatch({ effects: setLintGutterTooltip.of(null) });
    };
    window.addEventListener("mousemove", mousemove);
}
function gutterMarkerMouseOver(view, marker, diagnostics) {
    function hovered() {
        let line = view.elementAtHeight(marker.getBoundingClientRect().top + 5 - view.documentTop);
        const linePos = view.coordsAtPos(line.from);
        if (linePos) {
            view.dispatch({ effects: setLintGutterTooltip.of({
                    pos: line.from,
                    above: false,
                    create() {
                        return {
                            dom: diagnosticsTooltip(view, diagnostics),
                            getCoords: () => marker.getBoundingClientRect()
                        };
                    }
                }) });
        }
        marker.onmouseout = marker.onmousemove = null;
        trackHoverOn(view, marker);
    }
    let { hoverTime } = view.state.facet(lintGutterConfig);
    let hoverTimeout = setTimeout(hovered, hoverTime);
    marker.onmouseout = () => {
        clearTimeout(hoverTimeout);
        marker.onmouseout = marker.onmousemove = null;
    };
    marker.onmousemove = () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(hovered, hoverTime);
    };
}
function markersForDiagnostics(doc, diagnostics) {
    let byLine = Object.create(null);
    for (let diagnostic of diagnostics) {
        let line = doc.lineAt(diagnostic.from);
        (byLine[line.from] || (byLine[line.from] = [])).push(diagnostic);
    }
    let markers = [];
    for (let line in byLine) {
        markers.push(new LintGutterMarker(byLine[line]).range(+line));
    }
    return dist_state/* RangeSet.of */.Xs.of(markers, true);
}
const lintGutterExtension = gutter({
    class: "cm-gutter-lint",
    markers: view => view.state.field(lintGutterMarkers),
});
const lintGutterMarkers = dist_state/* StateField.define */.QQ.define({
    create() {
        return dist_state/* RangeSet.empty */.Xs.empty;
    },
    update(markers, tr) {
        markers = markers.map(tr.changes);
        for (let effect of tr.effects)
            if (effect.is(setDiagnosticsEffect)) {
                markers = markersForDiagnostics(tr.state.doc, effect.value);
            }
        return markers;
    }
});
const setLintGutterTooltip = dist_state/* StateEffect.define */.Py.define();
const lintGutterTooltip = dist_state/* StateField.define */.QQ.define({
    create() { return null; },
    update(tooltip, tr) {
        if (tooltip && tr.docChanged)
            tooltip = hideTooltip(tr, tooltip) ? null : Object.assign(Object.assign({}, tooltip), { pos: tr.changes.mapPos(tooltip.pos) });
        return tr.effects.reduce((t, e) => e.is(setLintGutterTooltip) ? e.value : t, tooltip);
    },
    provide: field => showTooltip.from(field)
});
const lintGutterTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-gutter-lint": {
        width: "1.4em",
        "& .cm-gutterElement": {
            padding: ".2em"
        }
    },
    ".cm-lint-marker": {
        width: "1em",
        height: "1em"
    },
    ".cm-lint-marker-info": {
        content: svg(`<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>`)
    },
    ".cm-lint-marker-warning": {
        content: svg(`<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>`),
    },
    ".cm-lint-marker-error:before": {
        content: svg(`<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>`)
    },
});
const lintGutterConfig = dist_state/* Facet.define */.r$.define({
    combine(configs) {
        return (0,dist_state/* combineConfig */.BO)(configs, {
            hoverTime: 300 /* Time */,
        });
    }
});
/** Returns an extension that installs a gutter showing markers for each line that has diagnostics, which can be hovered over to see the diagnostics. */
function lintGutter(config = {}) {
    return [lintGutterConfig.of(config), lintGutterMarkers, lintGutterExtension, lintGutterTheme, lintGutterTooltip];
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lint/index.js


;// CONCATENATED MODULE: ./sys/public/js/editor/default.js








const default_defaultConfig = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history_history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    dist_state/* EditorState.allowMultipleSelections.of */.yy.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap
    ])
];

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/lr/stack.js
class Stack {
    // @internal
    constructor(p, stack, state, 
    // The position at which the next reduce should take place. This
    // can be less than `this.pos` when skipped expressions have been
    // added to the stack (which should be moved outside of the next
    // reduction)
    // @internal
    reducePos, pos, 
    // @internal
    score, 
    // The output buffer. Holds (type, start, end, size) quads
    // representing nodes created by the parser, where `size` is
    // amount of buffer array entries covered by this node.
    // @internal
    buffer, 
    // The base offset of the buffer. When stacks are split, the split
    // instance shared the buffer history with its parent up to
    // `bufferBase`, which is the absolute offset (including the
    // offset of previous splits) into the buffer at which this stack
    // starts writing.
    // @internal
    bufferBase, 
    // @internal
    curContext, 
    // @internal
    lookAhead = 0, 
    // A parent stack from which this was split off, if any. This is
    // set up so that it always points to a stack that has some
    // additional buffer content, never to a stack with an equal
    // `bufferBase`.
    // @internal
    parent) {
        this.p = p;
        this.stack = stack;
        this.state = state;
        this.reducePos = reducePos;
        this.pos = pos;
        this.score = score;
        this.buffer = buffer;
        this.bufferBase = bufferBase;
        this.curContext = curContext;
        this.lookAhead = lookAhead;
        this.parent = parent;
    }
    // @internal
    toString() {
        return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
    }
    // Start an empty stack
    // @internal
    static start(p, state, pos = 0) {
        let cx = p.parser.context;
        return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
    }
    get context() { return this.curContext ? this.curContext.context : null; }
    // Push a state onto the stack, tracking its start position as well
    // as the buffer base at that point.
    // @internal
    pushState(state, start) {
        this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
        this.state = state;
    }
    // Apply a reduce action
    // @internal
    reduce(action) {
        let depth = action >> 19 /* ReduceDepthShift */, type = action & 65535 /* ValueMask */;
        let { parser } = this.p;
        let dPrec = parser.dynamicPrecedence(type);
        if (dPrec)
            this.score += dPrec;
        if (depth == 0) {
            this.pushState(parser.getGoto(this.state, type, true), this.reducePos);
            // Zero-depth reductions are a special case—they add stuff to
            // the stack without popping anything off.
            if (type < parser.minRepeatTerm)
                this.storeNode(type, this.reducePos, this.reducePos, 4, true);
            this.reduceContext(type, this.reducePos);
            return;
        }
        // Find the base index into `this.stack`, content after which will
        // be dropped. Note that with `StayFlag` reductions we need to
        // consume two extra frames (the dummy parent node for the skipped
        // expression and the state that we'll be staying in, which should
        // be moved to `this.state`).
        let base = this.stack.length - ((depth - 1) * 3) - (action & 262144 /* StayFlag */ ? 6 : 0);
        let start = this.stack[base - 2];
        let bufferBase = this.stack[base - 1], count = this.bufferBase + this.buffer.length - bufferBase;
        // Store normal terms or `R -> R R` repeat reductions
        if (type < parser.minRepeatTerm || (action & 131072 /* RepeatFlag */)) {
            let pos = parser.stateFlag(this.state, 1 /* Skipped */) ? this.pos : this.reducePos;
            this.storeNode(type, start, pos, count + 4, true);
        }
        if (action & 262144 /* StayFlag */) {
            this.state = this.stack[base];
        }
        else {
            let baseStateID = this.stack[base - 3];
            this.state = parser.getGoto(baseStateID, type, true);
        }
        while (this.stack.length > base)
            this.stack.pop();
        this.reduceContext(type, start);
    }
    // Shift a value into the buffer
    // @internal
    storeNode(term, start, end, size = 4, isReduce = false) {
        if (term == 0 /* Err */ &&
            (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
            // Try to omit/merge adjacent error nodes
            let cur = this, top = this.buffer.length;
            if (top == 0 && cur.parent) {
                top = cur.bufferBase - cur.parent.bufferBase;
                cur = cur.parent;
            }
            if (top > 0 && cur.buffer[top - 4] == 0 /* Err */ && cur.buffer[top - 1] > -1) {
                if (start == end)
                    return;
                if (cur.buffer[top - 2] >= start) {
                    cur.buffer[top - 2] = end;
                    return;
                }
            }
        }
        if (!isReduce || this.pos == end) { // Simple case, just append
            this.buffer.push(term, start, end, size);
        }
        else { // There may be skipped nodes that have to be moved forward
            let index = this.buffer.length;
            if (index > 0 && this.buffer[index - 4] != 0 /* Err */)
                while (index > 0 && this.buffer[index - 2] > end) {
                    // Move this record forward
                    this.buffer[index] = this.buffer[index - 4];
                    this.buffer[index + 1] = this.buffer[index - 3];
                    this.buffer[index + 2] = this.buffer[index - 2];
                    this.buffer[index + 3] = this.buffer[index - 1];
                    index -= 4;
                    if (size > 4)
                        size -= 4;
                }
            this.buffer[index] = term;
            this.buffer[index + 1] = start;
            this.buffer[index + 2] = end;
            this.buffer[index + 3] = size;
        }
    }
    // Apply a shift action
    // @internal
    shift(action, next, nextEnd) {
        let start = this.pos;
        if (action & 131072 /* GotoFlag */) {
            this.pushState(action & 65535 /* ValueMask */, this.pos);
        }
        else if ((action & 262144 /* StayFlag */) == 0) { // Regular shift
            let nextState = action, { parser } = this.p;
            if (nextEnd > this.pos || next <= parser.maxNode) {
                this.pos = nextEnd;
                if (!parser.stateFlag(nextState, 1 /* Skipped */))
                    this.reducePos = nextEnd;
            }
            this.pushState(nextState, start);
            this.shiftContext(next, start);
            if (next <= parser.maxNode)
                this.buffer.push(next, start, nextEnd, 4);
        }
        else { // Shift-and-stay, which means this is a skipped token
            this.pos = nextEnd;
            this.shiftContext(next, start);
            if (next <= this.p.parser.maxNode)
                this.buffer.push(next, start, nextEnd, 4);
        }
    }
    // Apply an action
    // @internal
    apply(action, next, nextEnd) {
        if (action & 65536 /* ReduceFlag */)
            this.reduce(action);
        else
            this.shift(action, next, nextEnd);
    }
    // Add a prebuilt (reused) node into the buffer.
    // @internal
    useNode(value, next) {
        let index = this.p.reused.length - 1;
        if (index < 0 || this.p.reused[index] != value) {
            this.p.reused.push(value);
            index++;
        }
        let start = this.pos;
        this.reducePos = this.pos = start + value.length;
        this.pushState(next, start);
        this.buffer.push(index, start, this.reducePos, -1 /* size == -1 means this is a reused value */);
        if (this.curContext)
            this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
    }
    // Split the stack. Due to the buffer sharing and the fact
    // that `this.stack` tends to stay quite shallow, this isn't very
    // expensive.
    // @internal
    split() {
        let parent = this;
        let off = parent.buffer.length;
        // Because the top of the buffer (after this.pos) may be mutated
        // to reorder reductions and skipped tokens, and shared buffers
        // should be immutable, this copies any outstanding skipped tokens
        // to the new buffer, and puts the base pointer before them.
        while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
            off -= 4;
        let buffer = parent.buffer.slice(off), base = parent.bufferBase + off;
        // Make sure parent points to an actual parent with content, if there is such a parent.
        while (parent && base == parent.bufferBase)
            parent = parent.parent;
        return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base, this.curContext, this.lookAhead, parent);
    }
    // Try to recover from an error by 'deleting' (ignoring) one token.
    // @internal
    recoverByDelete(next, nextEnd) {
        let isNode = next <= this.p.parser.maxNode;
        if (isNode)
            this.storeNode(next, this.pos, nextEnd, 4);
        this.storeNode(0 /* Err */, this.pos, nextEnd, isNode ? 8 : 4);
        this.pos = this.reducePos = nextEnd;
        this.score -= 190 /* Delete */;
    }
    canShift(term) {
        for (let sim = new SimulatedStack(this);;) {
            let action = this.p.parser.stateSlot(sim.state, 4 /* DefaultReduce */) || this.p.parser.hasAction(sim.state, term);
            if ((action & 65536 /* ReduceFlag */) == 0)
                return true;
            if (action == 0)
                return false;
            sim.reduce(action);
        }
    }
    // Apply up to Recover.MaxNext recovery actions that conceptually
    // inserts some missing token or rule.
    // @internal
    recoverByInsert(next) {
        if (this.stack.length >= 300 /* MaxInsertStackDepth */)
            return [];
        let nextStates = this.p.parser.nextStates(this.state);
        if (nextStates.length > 4 /* MaxNext */ << 1 || this.stack.length >= 120 /* DampenInsertStackDepth */) {
            let best = [];
            for (let i = 0, s; i < nextStates.length; i += 2) {
                if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
                    best.push(nextStates[i], s);
            }
            if (this.stack.length < 120 /* DampenInsertStackDepth */)
                for (let i = 0; best.length < 4 /* MaxNext */ << 1 && i < nextStates.length; i += 2) {
                    let s = nextStates[i + 1];
                    if (!best.some((v, i) => (i & 1) && v == s))
                        best.push(nextStates[i], s);
                }
            nextStates = best;
        }
        let result = [];
        for (let i = 0; i < nextStates.length && result.length < 4 /* MaxNext */; i += 2) {
            let s = nextStates[i + 1];
            if (s == this.state)
                continue;
            let stack = this.split();
            stack.pushState(s, this.pos);
            stack.storeNode(0 /* Err */, stack.pos, stack.pos, 4, true);
            stack.shiftContext(nextStates[i], this.pos);
            stack.score -= 200 /* Insert */;
            result.push(stack);
        }
        return result;
    }
    // Force a reduce, if possible. Return false if that can't
    // be done.
    // @internal
    forceReduce() {
        let reduce = this.p.parser.stateSlot(this.state, 5 /* ForcedReduce */);
        if ((reduce & 65536 /* ReduceFlag */) == 0)
            return false;
        let { parser } = this.p;
        if (!parser.validAction(this.state, reduce)) {
            let depth = reduce >> 19 /* ReduceDepthShift */, term = reduce & 65535 /* ValueMask */;
            let target = this.stack.length - depth * 3;
            if (target < 0 || parser.getGoto(this.stack[target], term, false) < 0)
                return false;
            this.storeNode(0 /* Err */, this.reducePos, this.reducePos, 4, true);
            this.score -= 100 /* Reduce */;
        }
        this.reduce(reduce);
        return true;
    }
    // @internal
    forceAll() {
        while (!this.p.parser.stateFlag(this.state, 2 /* Accepting */)) {
            if (!this.forceReduce()) {
                this.storeNode(0 /* Err */, this.pos, this.pos, 4, true);
                break;
            }
        }
        return this;
    }
    get deadEnd() {
        if (this.stack.length != 3)
            return false;
        let { parser } = this.p;
        return parser.data[parser.stateSlot(this.state, 1 /* Actions */)] == 65535 /* End */ &&
            !parser.stateSlot(this.state, 4 /* DefaultReduce */);
    }
    restart() {
        this.state = this.stack[0];
        this.stack.length = 0;
    }
    // @internal
    sameState(other) {
        if (this.state != other.state || this.stack.length != other.stack.length)
            return false;
        for (let i = 0; i < this.stack.length; i += 3)
            if (this.stack[i] != other.stack[i])
                return false;
        return true;
    }
    get parser() { return this.p.parser; }
    dialectEnabled(dialectID) { return this.p.parser.dialect.flags[dialectID]; }
    shiftContext(term, start) {
        if (this.curContext)
            this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
    reduceContext(term, start) {
        if (this.curContext)
            this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
    // @internal
    emitContext() {
        let last = this.buffer.length - 1;
        if (last < 0 || this.buffer[last] != -3)
            this.buffer.push(this.curContext.hash, this.reducePos, this.reducePos, -3);
    }
    // @internal
    emitLookAhead() {
        let last = this.buffer.length - 1;
        if (last < 0 || this.buffer[last] != -4)
            this.buffer.push(this.lookAhead, this.reducePos, this.reducePos, -4);
    }
    updateContext(context) {
        if (context != this.curContext.context) {
            let newCx = new StackContext(this.curContext.tracker, context);
            if (newCx.hash != this.curContext.hash)
                this.emitContext();
            this.curContext = newCx;
        }
    }
    // @internal
    setLookAhead(lookAhead) {
        if (lookAhead > this.lookAhead) {
            this.emitLookAhead();
            this.lookAhead = lookAhead;
        }
    }
    // @internal
    close() {
        if (this.curContext && this.curContext.tracker.strict)
            this.emitContext();
        if (this.lookAhead > 0)
            this.emitLookAhead();
    }
}
class StackContext {
    constructor(tracker, context) {
        this.tracker = tracker;
        this.context = context;
        this.hash = tracker.strict ? tracker.hash(context) : 0;
    }
}
// Used to cheaply run some reductions to scan ahead without mutating
// an entire stack
class SimulatedStack {
    constructor(start) {
        this.start = start;
        this.state = start.state;
        this.stack = start.stack;
        this.base = this.stack.length;
    }
    reduce(action) {
        let term = action & 65535 /* ValueMask */, depth = action >> 19 /* ReduceDepthShift */;
        if (depth == 0) {
            if (this.stack == this.start.stack)
                this.stack = this.stack.slice();
            this.stack.push(this.state, 0, 0);
            this.base += 3;
        }
        else {
            this.base -= (depth - 1) * 3;
        }
        let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
        this.state = goto;
    }
}
// This is given to `Tree.build` to build a buffer, and encapsulates
// the parent-stack-walking necessary to read the nodes.
class StackBufferCursor {
    constructor(stack, pos, index) {
        this.stack = stack;
        this.pos = pos;
        this.index = index;
        this.buffer = stack.buffer;
        if (this.index == 0)
            this.maybeNext();
    }
    static create(stack, pos = stack.bufferBase + stack.buffer.length) {
        return new StackBufferCursor(stack, pos, pos - stack.bufferBase);
    }
    maybeNext() {
        let next = this.stack.parent;
        if (next != null) {
            this.index = this.stack.bufferBase - next.bufferBase;
            this.stack = next;
            this.buffer = next.buffer;
        }
    }
    get id() { return this.buffer[this.index - 4]; }
    get start() { return this.buffer[this.index - 3]; }
    get end() { return this.buffer[this.index - 2]; }
    get size() { return this.buffer[this.index - 1]; }
    next() {
        this.index -= 4;
        this.pos -= 4;
        if (this.index == 0)
            this.maybeNext();
    }
    fork() {
        return new StackBufferCursor(this.stack, this.pos, this.index);
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/lr/token.js
class CachedToken {
    constructor() {
        this.start = -1;
        this.value = -1;
        this.end = -1;
        this.extended = -1;
        this.lookAhead = 0;
        this.mask = 0;
        this.context = 0;
    }
}
const nullToken = new CachedToken;
class InputStream {
    // @internal
    constructor(
    // @internal
    input, 
    // @internal
    ranges) {
        this.input = input;
        this.ranges = ranges;
        // @internal
        this.chunk = "";
        // @internal
        this.chunkOff = 0;
        this.chunk2 = "";
        this.chunk2Pos = 0;
        this.next = -1;
        // @internal
        this.token = nullToken;
        this.rangeIndex = 0;
        this.pos = this.chunkPos = ranges[0].from;
        this.range = ranges[0];
        this.end = ranges[ranges.length - 1].to;
        this.readNext();
    }
    resolveOffset(offset, assoc) {
        let range = this.range, index = this.rangeIndex;
        let pos = this.pos + offset;
        while (pos < range.from) {
            if (!index)
                return null;
            let next = this.ranges[--index];
            pos -= range.from - next.to;
            range = next;
        }
        while (assoc < 0 ? pos > range.to : pos >= range.to) {
            if (index == this.ranges.length - 1)
                return null;
            let next = this.ranges[++index];
            pos += next.from - range.to;
            range = next;
        }
        return pos;
    }
    peek(offset) {
        let idx = this.chunkOff + offset, pos, result;
        if (idx >= 0 && idx < this.chunk.length) {
            pos = this.pos + offset;
            result = this.chunk.charCodeAt(idx);
        }
        else {
            let resolved = this.resolveOffset(offset, 1);
            if (resolved == null)
                return -1;
            pos = resolved;
            if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
                result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
            }
            else {
                let i = this.rangeIndex, range = this.range;
                while (range.to <= pos)
                    range = this.ranges[++i];
                this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
                if (pos + this.chunk2.length > range.to)
                    this.chunk2 = this.chunk2.slice(0, range.to - pos);
                result = this.chunk2.charCodeAt(0);
            }
        }
        if (pos >= this.token.lookAhead)
            this.token.lookAhead = pos + 1;
        return result;
    }
    acceptToken(token, endOffset = 0) {
        let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
        if (end == null || end < this.token.start)
            throw new RangeError("Token end out of bounds");
        this.token.value = token;
        this.token.end = end;
    }
    getChunk() {
        if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
            let { chunk, chunkPos } = this;
            this.chunk = this.chunk2;
            this.chunkPos = this.chunk2Pos;
            this.chunk2 = chunk;
            this.chunk2Pos = chunkPos;
            this.chunkOff = this.pos - this.chunkPos;
        }
        else {
            this.chunk2 = this.chunk;
            this.chunk2Pos = this.chunkPos;
            let nextChunk = this.input.chunk(this.pos);
            let end = this.pos + nextChunk.length;
            this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
            this.chunkPos = this.pos;
            this.chunkOff = 0;
        }
    }
    readNext() {
        if (this.chunkOff >= this.chunk.length) {
            this.getChunk();
            if (this.chunkOff == this.chunk.length)
                return this.next = -1;
        }
        return this.next = this.chunk.charCodeAt(this.chunkOff);
    }
    advance(n = 1) {
        this.chunkOff += n;
        while (this.pos + n >= this.range.to) {
            if (this.rangeIndex == this.ranges.length - 1)
                return this.setDone();
            n -= this.range.to - this.pos;
            this.range = this.ranges[++this.rangeIndex];
            this.pos = this.range.from;
        }
        this.pos += n;
        if (this.pos >= this.token.lookAhead)
            this.token.lookAhead = this.pos + 1;
        return this.readNext();
    }
    setDone() {
        this.pos = this.chunkPos = this.end;
        this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
        this.chunk = "";
        return this.next = -1;
    }
    // @internal
    reset(pos, token) {
        if (token) {
            this.token = token;
            token.start = pos;
            token.lookAhead = pos + 1;
            token.value = token.extended = -1;
        }
        else {
            this.token = nullToken;
        }
        if (this.pos != pos) {
            this.pos = pos;
            if (pos == this.end) {
                this.setDone();
                return this;
            }
            while (pos < this.range.from)
                this.range = this.ranges[--this.rangeIndex];
            while (pos >= this.range.to)
                this.range = this.ranges[++this.rangeIndex];
            if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
                this.chunkOff = pos - this.chunkPos;
            }
            else {
                this.chunk = "";
                this.chunkOff = 0;
            }
            this.readNext();
        }
        return this;
    }
    // @internal
    read(from, to) {
        if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
            return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
        if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length)
            return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
        if (from >= this.range.from && to <= this.range.to)
            return this.input.read(from, to);
        let result = "";
        for (let r of this.ranges) {
            if (r.from >= to)
                break;
            if (r.to > from)
                result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
        }
        return result;
    }
}
// @internal
class TokenGroup {
    constructor(data, id) {
        this.data = data;
        this.id = id;
    }
    token(input, stack) { token_readToken(this.data, input, stack, this.id); }
}
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
class ExternalTokenizer {
    constructor(
    // @internal
    token, options = {}) {
        this.token = token;
        this.contextual = !!options.contextual;
        this.fallback = !!options.fallback;
        this.extend = !!options.extend;
    }
}
// Tokenizer data is stored a big uint16 array containing, for each
// state:
//
//  - A group bitmask, indicating what token groups are reachable from
//    this state, so that paths that can only lead to tokens not in
//    any of the current groups can be cut off early.
//
//  - The position of the end of the state's sequence of accepting
//    tokens
//
//  - The number of outgoing edges for the state
//
//  - The accepting tokens, as (token id, group mask) pairs
//
//  - The outgoing edges, as (start character, end character, state
//    index) triples, with end character being exclusive
//
// This function interprets that data, running through a stream as
// long as new states with the a matching group mask can be reached,
// and updating `token` when it matches a token.
function token_readToken(data, input, stack, group) {
    let state = 0, groupMask = (1 << group), { parser } = stack.p, { dialect } = parser;
    scan: for (;;) {
        if ((groupMask & data[state]) == 0)
            break;
        let accEnd = data[state + 1];
        // Check whether this state can lead to a token in the current group
        // Accept tokens in this state, possibly overwriting
        // lower-precedence / shorter tokens
        for (let i = state + 3; i < accEnd; i += 2)
            if ((data[i + 1] & groupMask) > 0) {
                let term = data[i];
                if (dialect.allows(term) &&
                    (input.token.value == -1 || input.token.value == term || parser.overrides(term, input.token.value))) {
                    input.acceptToken(term);
                    break;
                }
            }
        // Do a binary search on the state's edges
        for (let next = input.next, low = 0, high = data[state + 2]; low < high;) {
            let mid = (low + high) >> 1;
            let index = accEnd + mid + (mid << 1);
            let from = data[index], to = data[index + 1];
            if (next < from)
                high = mid;
            else if (next >= to)
                low = mid + 1;
            else {
                state = data[index + 2];
                input.advance();
                continue scan;
            }
        }
        break;
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/lr/decode.js
function decodeArray(input, Type = Uint16Array) {
    if (typeof input != "string")
        return input;
    let array = null;
    for (let pos = 0, out = 0; pos < input.length;) {
        let value = 0;
        for (;;) {
            let next = input.charCodeAt(pos++), stop = false;
            if (next == 126 /* BigValCode */) {
                value = 65535 /* BigVal */;
                break;
            }
            if (next >= 92 /* Gap2 */)
                next--;
            if (next >= 34 /* Gap1 */)
                next--;
            let digit = next - 32 /* Start */;
            if (digit >= 46 /* Base */) {
                digit -= 46 /* Base */;
                stop = true;
            }
            value += digit;
            if (stop)
                break;
            value *= 46 /* Base */;
        }
        if (array)
            array[out++] = value;
        else
            array = new Type(value);
    }
    return array;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/lr/parse.js




// Environment variable used to control console output
// @ts-ignore
const verbose = typeof process != "undefined" && /\bparse\b/.test(process.env.LOG);
let stackIDs = null;
function cutAt(tree, pos, side) {
    let cursor = tree.cursor(tree_IterMode.IncludeAnonymous);
    cursor.moveTo(pos);
    for (;;) {
        if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
            for (;;) {
                if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
                    return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 25 /* Margin */))
                        : Math.min(tree.length, Math.max(cursor.from + 1, pos + 25 /* Margin */));
                if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
                    break;
                if (!cursor.parent())
                    return side < 0 ? 0 : tree.length;
            }
    }
}
class parse_FragmentCursor {
    constructor(fragments, nodeSet) {
        this.fragments = fragments;
        this.nodeSet = nodeSet;
        this.i = 0;
        this.fragment = null;
        this.safeFrom = -1;
        this.safeTo = -1;
        this.trees = [];
        this.start = [];
        this.index = [];
        this.nextFragment();
    }
    nextFragment() {
        let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
        if (fr) {
            this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
            this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
            while (this.trees.length) {
                this.trees.pop();
                this.start.pop();
                this.index.pop();
            }
            this.trees.push(fr.tree);
            this.start.push(-fr.offset);
            this.index.push(0);
            this.nextStart = this.safeFrom;
        }
        else {
            this.nextStart = 1e9;
        }
    }
    // `pos` must be >= any previously given `pos` for this cursor
    nodeAt(pos) {
        if (pos < this.nextStart)
            return null;
        while (this.fragment && this.safeTo <= pos)
            this.nextFragment();
        if (!this.fragment)
            return null;
        for (;;) {
            let last = this.trees.length - 1;
            if (last < 0) { // End of tree
                this.nextFragment();
                return null;
            }
            let top = this.trees[last], index = this.index[last];
            if (index == top.children.length) {
                this.trees.pop();
                this.start.pop();
                this.index.pop();
                continue;
            }
            let next = top.children[index];
            let start = this.start[last] + top.positions[index];
            if (start > pos) {
                this.nextStart = start;
                return null;
            }
            if (next instanceof tree_Tree) {
                if (start == pos) {
                    if (start < this.safeFrom)
                        return null;
                    let end = start + next.length;
                    if (end <= this.safeTo) {
                        let lookAhead = next.prop(tree_NodeProp.lookAhead);
                        if (!lookAhead || end + lookAhead < this.fragment.to)
                            return next;
                    }
                }
                this.index[last]++;
                if (start + next.length >= Math.max(this.safeFrom, pos)) { // Enter this node
                    this.trees.push(next);
                    this.start.push(start);
                    this.index.push(0);
                }
            }
            else {
                this.index[last]++;
                this.nextStart = start + next.length;
            }
        }
    }
}
class TokenCache {
    constructor(parser, stream) {
        this.stream = stream;
        this.tokens = [];
        this.mainToken = null;
        this.actions = [];
        this.tokens = parser.tokenizers.map(_ => new CachedToken);
    }
    getActions(stack) {
        let actionIndex = 0;
        let main = null;
        let { parser } = stack.p, { tokenizers } = parser;
        let mask = parser.stateSlot(stack.state, 3 /* TokenizerMask */);
        let context = stack.curContext ? stack.curContext.hash : 0;
        let lookAhead = 0;
        for (let i = 0; i < tokenizers.length; i++) {
            if (((1 << i) & mask) == 0)
                continue;
            let tokenizer = tokenizers[i], token = this.tokens[i];
            if (main && !tokenizer.fallback)
                continue;
            if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
                this.updateCachedToken(token, tokenizer, stack);
                token.mask = mask;
                token.context = context;
            }
            if (token.lookAhead > token.end + 25 /* Margin */)
                lookAhead = Math.max(token.lookAhead, lookAhead);
            if (token.value != 0 /* Err */) {
                let startIndex = actionIndex;
                if (token.extended > -1)
                    actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
                actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
                if (!tokenizer.extend) {
                    main = token;
                    if (actionIndex > startIndex)
                        break;
                }
            }
        }
        while (this.actions.length > actionIndex)
            this.actions.pop();
        if (lookAhead)
            stack.setLookAhead(lookAhead);
        if (!main && stack.pos == this.stream.end) {
            main = new CachedToken;
            main.value = stack.p.parser.eofTerm;
            main.start = main.end = stack.pos;
            actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
        }
        this.mainToken = main;
        return this.actions;
    }
    getMainToken(stack) {
        if (this.mainToken)
            return this.mainToken;
        let main = new CachedToken, { pos, p } = stack;
        main.start = pos;
        main.end = Math.min(pos + 1, p.stream.end);
        main.value = pos == p.stream.end ? p.parser.eofTerm : 0 /* Err */;
        return main;
    }
    updateCachedToken(token, tokenizer, stack) {
        tokenizer.token(this.stream.reset(stack.pos, token), stack);
        if (token.value > -1) {
            let { parser } = stack.p;
            for (let i = 0; i < parser.specialized.length; i++)
                if (parser.specialized[i] == token.value) {
                    let result = parser.specializers[i](this.stream.read(token.start, token.end), stack);
                    if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
                        if ((result & 1) == 0 /* Specialize */)
                            token.value = result >> 1;
                        else
                            token.extended = result >> 1;
                        break;
                    }
                }
        }
        else {
            token.value = 0 /* Err */;
            token.end = Math.min(stack.p.stream.end, stack.pos + 1);
        }
    }
    putAction(action, token, end, index) {
        // Don't add duplicate actions
        for (let i = 0; i < index; i += 3)
            if (this.actions[i] == action)
                return index;
        this.actions[index++] = action;
        this.actions[index++] = token;
        this.actions[index++] = end;
        return index;
    }
    addActions(stack, token, end, index) {
        let { state } = stack, { parser } = stack.p, { data } = parser;
        for (let set = 0; set < 2; set++) {
            for (let i = parser.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */);; i += 3) {
                if (data[i] == 65535 /* End */) {
                    if (data[i + 1] == 1 /* Next */) {
                        i = pair(data, i + 2);
                    }
                    else {
                        if (index == 0 && data[i + 1] == 2 /* Other */)
                            index = this.putAction(pair(data, i + 2), token, end, index);
                        break;
                    }
                }
                if (data[i] == token)
                    index = this.putAction(pair(data, i + 1), token, end, index);
            }
        }
        return index;
    }
}
class parse_Parse {
    constructor(parser, input, fragments, ranges) {
        this.parser = parser;
        this.input = input;
        this.ranges = ranges;
        this.recovering = 0;
        this.nextStackID = 0x2654; // ♔, ♕, ♖, ♗, ♘, ♙, ♠, ♡, ♢, ♣, ♤, ♥, ♦, ♧
        this.minStackPos = 0;
        this.reused = [];
        this.stoppedAt = null;
        this.stream = new InputStream(input, ranges);
        this.tokens = new TokenCache(parser, this.stream);
        this.topTerm = parser.top[1];
        let { from } = ranges[0];
        this.stacks = [Stack.start(this, parser.top[0], from)];
        this.fragments = fragments.length && this.stream.end - from > parser.bufferLength * 4
            ? new parse_FragmentCursor(fragments, parser.nodeSet) : null;
    }
    get parsedPos() {
        return this.minStackPos;
    }
    // Move the parser forward. This will process all parse stacks at
    // `this.pos` and try to advance them to a further position. If no
    // stack for such a position is found, it'll start error-recovery.
    //
    // When the parse is finished, this will return a syntax tree. When
    // not, it returns `null`.
    advance() {
        let stacks = this.stacks, pos = this.minStackPos;
        // This will hold stacks beyond `pos`.
        let newStacks = this.stacks = [];
        let stopped, stoppedTokens;
        // Keep advancing any stacks at `pos` until they either move
        // forward or can't be advanced. Gather stacks that can't be
        // advanced further in `stopped`.
        for (let i = 0; i < stacks.length; i++) {
            let stack = stacks[i];
            for (;;) {
                this.tokens.mainToken = null;
                if (stack.pos > pos) {
                    newStacks.push(stack);
                }
                else if (this.advanceStack(stack, newStacks, stacks)) {
                    continue;
                }
                else {
                    if (!stopped) {
                        stopped = [];
                        stoppedTokens = [];
                    }
                    stopped.push(stack);
                    let tok = this.tokens.getMainToken(stack);
                    stoppedTokens.push(tok.value, tok.end);
                }
                break;
            }
        }
        if (!newStacks.length) {
            let finished = stopped && findFinished(stopped);
            if (finished)
                return this.stackToTree(finished);
            if (this.parser.strict) {
                if (verbose && stopped)
                    console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
                throw new SyntaxError("No parse at " + pos);
            }
            if (!this.recovering)
                this.recovering = 5 /* Distance */;
        }
        if (this.recovering && stopped) {
            let finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0]
                : this.runRecovery(stopped, stoppedTokens, newStacks);
            if (finished)
                return this.stackToTree(finished.forceAll());
        }
        if (this.recovering) {
            let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3 /* MaxRemainingPerStep */;
            if (newStacks.length > maxRemaining) {
                newStacks.sort((a, b) => b.score - a.score);
                while (newStacks.length > maxRemaining)
                    newStacks.pop();
            }
            if (newStacks.some(s => s.reducePos > pos))
                this.recovering--;
        }
        else if (newStacks.length > 1) {
            // Prune stacks that are in the same state, or that have been
            // running without splitting for a while, to avoid getting stuck
            // with multiple successful stacks running endlessly on.
            outer: for (let i = 0; i < newStacks.length - 1; i++) {
                let stack = newStacks[i];
                for (let j = i + 1; j < newStacks.length; j++) {
                    let other = newStacks[j];
                    if (stack.sameState(other) ||
                        stack.buffer.length > 500 /* MinBufferLengthPrune */ && other.buffer.length > 500 /* MinBufferLengthPrune */) {
                        if (((stack.score - other.score) || (stack.buffer.length - other.buffer.length)) > 0) {
                            newStacks.splice(j--, 1);
                        }
                        else {
                            newStacks.splice(i--, 1);
                            continue outer;
                        }
                    }
                }
            }
        }
        this.minStackPos = newStacks[0].pos;
        for (let i = 1; i < newStacks.length; i++)
            if (newStacks[i].pos < this.minStackPos)
                this.minStackPos = newStacks[i].pos;
        return null;
    }
    stopAt(pos) {
        if (this.stoppedAt != null && this.stoppedAt < pos)
            throw new RangeError("Can't move stoppedAt forward");
        this.stoppedAt = pos;
    }
    // Returns an updated version of the given stack, or null if the
    // stack can't advance normally. When `split` and `stacks` are
    // given, stacks split off by ambiguous operations will be pushed to
    // `split`, or added to `stacks` if they move `pos` forward.
    advanceStack(stack, stacks, split) {
        let start = stack.pos, { parser } = this;
        let base = verbose ? this.stackID(stack) + " -> " : "";
        if (this.stoppedAt != null && start > this.stoppedAt)
            return stack.forceReduce() ? stack : null;
        if (this.fragments) {
            let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
            for (let cached = this.fragments.nodeAt(start); cached;) {
                let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser.getGoto(stack.state, cached.type.id) : -1;
                if (match > -1 && cached.length && (!strictCx || (cached.prop(tree_NodeProp.contextHash) || 0) == cxHash)) {
                    stack.useNode(cached, match);
                    if (verbose)
                        console.log(base + this.stackID(stack) + ` (via reuse of ${parser.getName(cached.type.id)})`);
                    return true;
                }
                if (!(cached instanceof tree_Tree) || cached.children.length == 0 || cached.positions[0] > 0)
                    break;
                let inner = cached.children[0];
                if (inner instanceof tree_Tree && cached.positions[0] == 0)
                    cached = inner;
                else
                    break;
            }
        }
        let defaultReduce = parser.stateSlot(stack.state, 4 /* DefaultReduce */);
        if (defaultReduce > 0) {
            stack.reduce(defaultReduce);
            if (verbose)
                console.log(base + this.stackID(stack) + ` (via always-reduce ${parser.getName(defaultReduce & 65535 /* ValueMask */)})`);
            return true;
        }
        if (stack.stack.length >= 15000 /* CutDepth */) {
            while (stack.stack.length > 9000 /* CutTo */ && stack.forceReduce()) { }
        }
        let actions = this.tokens.getActions(stack);
        for (let i = 0; i < actions.length;) {
            let action = actions[i++], term = actions[i++], end = actions[i++];
            let last = i == actions.length || !split;
            let localStack = last ? stack : stack.split();
            localStack.apply(action, term, end);
            if (verbose)
                console.log(base + this.stackID(localStack) + ` (via ${(action & 65536 /* ReduceFlag */) == 0 ? "shift"
                    : `reduce of ${parser.getName(action & 65535 /* ValueMask */)}`} for ${parser.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
            if (last)
                return true;
            else if (localStack.pos > start)
                stacks.push(localStack);
            else
                split.push(localStack);
        }
        return false;
    }
    // Advance a given stack forward as far as it will go. Returns the
    // (possibly updated) stack if it got stuck, or null if it moved
    // forward and was given to `pushStackDedup`.
    advanceFully(stack, newStacks) {
        let pos = stack.pos;
        for (;;) {
            if (!this.advanceStack(stack, null, null))
                return false;
            if (stack.pos > pos) {
                pushStackDedup(stack, newStacks);
                return true;
            }
        }
    }
    runRecovery(stacks, tokens, newStacks) {
        let finished = null, restarted = false;
        for (let i = 0; i < stacks.length; i++) {
            let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
            let base = verbose ? this.stackID(stack) + " -> " : "";
            if (stack.deadEnd) {
                if (restarted)
                    continue;
                restarted = true;
                stack.restart();
                if (verbose)
                    console.log(base + this.stackID(stack) + " (restarted)");
                let done = this.advanceFully(stack, newStacks);
                if (done)
                    continue;
            }
            let force = stack.split(), forceBase = base;
            for (let j = 0; force.forceReduce() && j < 10 /* ForceReduceLimit */; j++) {
                if (verbose)
                    console.log(forceBase + this.stackID(force) + " (via force-reduce)");
                let done = this.advanceFully(force, newStacks);
                if (done)
                    break;
                if (verbose)
                    forceBase = this.stackID(force) + " -> ";
            }
            for (let insert of stack.recoverByInsert(token)) {
                if (verbose)
                    console.log(base + this.stackID(insert) + " (via recover-insert)");
                this.advanceFully(insert, newStacks);
            }
            if (this.stream.end > stack.pos) {
                if (tokenEnd == stack.pos) {
                    tokenEnd++;
                    token = 0 /* Err */;
                }
                stack.recoverByDelete(token, tokenEnd);
                if (verbose)
                    console.log(base + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
                pushStackDedup(stack, newStacks);
            }
            else if (!finished || finished.score < stack.score) {
                finished = stack;
            }
        }
        return finished;
    }
    // Convert the stack's buffer to a syntax tree.
    stackToTree(stack) {
        stack.close();
        return tree_Tree.build({ buffer: StackBufferCursor.create(stack),
            nodeSet: this.parser.nodeSet,
            topID: this.topTerm,
            maxBufferLength: this.parser.bufferLength,
            reused: this.reused,
            start: this.ranges[0].from,
            length: stack.pos - this.ranges[0].from,
            minRepeatType: this.parser.minRepeatTerm });
    }
    stackID(stack) {
        let id = (stackIDs || (stackIDs = new WeakMap)).get(stack);
        if (!id)
            stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
        return id + stack;
    }
}
function pushStackDedup(stack, newStacks) {
    for (let i = 0; i < newStacks.length; i++) {
        let other = newStacks[i];
        if (other.pos == stack.pos && other.sameState(stack)) {
            if (newStacks[i].score < stack.score)
                newStacks[i] = stack;
            return;
        }
    }
    newStacks.push(stack);
}
class Dialect {
    constructor(source, flags, disabled) {
        this.source = source;
        this.flags = flags;
        this.disabled = disabled;
    }
    allows(term) { return !this.disabled || this.disabled[term] == 0; }
}
const id = x => x;
class ContextTracker {
    constructor(spec) {
        this.start = spec.start;
        this.shift = spec.shift || id;
        this.reduce = spec.reduce || id;
        this.reuse = spec.reuse || id;
        this.hash = spec.hash || (() => 0);
        this.strict = spec.strict !== false;
    }
}
class LRParser extends Parser {
    // @internal
    constructor(spec) {
        super();
        // @internal
        this.wrappers = [];
        if (spec.version != 14 /* Version */)
            throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${14 /* Version */})`);
        let nodeNames = spec.nodeNames.split(" ");
        this.minRepeatTerm = nodeNames.length;
        for (let i = 0; i < spec.repeatNodeCount; i++)
            nodeNames.push("");
        let topTerms = Object.keys(spec.topRules).map(r => spec.topRules[r][1]);
        let nodeProps = [];
        for (let i = 0; i < nodeNames.length; i++)
            nodeProps.push([]);
        function setProp(nodeID, prop, value) {
            nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
        }
        if (spec.nodeProps)
            for (let propSpec of spec.nodeProps) {
                let prop = propSpec[0];
                if (typeof prop == "string")
                    prop = tree_NodeProp[prop];
                for (let i = 1; i < propSpec.length;) {
                    let next = propSpec[i++];
                    if (next >= 0) {
                        setProp(next, prop, propSpec[i++]);
                    }
                    else {
                        let value = propSpec[i + -next];
                        for (let j = -next; j > 0; j--)
                            setProp(propSpec[i++], prop, value);
                        i++;
                    }
                }
            }
        this.nodeSet = new NodeSet(nodeNames.map((name, i) => tree_NodeType.define({
            name: i >= this.minRepeatTerm ? undefined : name,
            id: i,
            props: nodeProps[i],
            top: topTerms.indexOf(i) > -1,
            error: i == 0,
            skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
        })));
        if (spec.propSources)
            this.nodeSet = this.nodeSet.extend(...spec.propSources);
        this.strict = false;
        this.bufferLength = DefaultBufferLength;
        let tokenArray = decodeArray(spec.tokenData);
        this.context = spec.context;
        this.specialized = new Uint16Array(spec.specialized ? spec.specialized.length : 0);
        this.specializers = [];
        if (spec.specialized)
            for (let i = 0; i < spec.specialized.length; i++) {
                this.specialized[i] = spec.specialized[i].term;
                this.specializers[i] = spec.specialized[i].get;
            }
        this.states = decodeArray(spec.states, Uint32Array);
        this.data = decodeArray(spec.stateData);
        this.goto = decodeArray(spec.goto);
        this.maxTerm = spec.maxTerm;
        this.tokenizers = spec.tokenizers.map(value => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
        this.topRules = spec.topRules;
        this.dialects = spec.dialects || {};
        this.dynamicPrecedences = spec.dynamicPrecedences || null;
        this.tokenPrecTable = spec.tokenPrec;
        this.termNames = spec.termNames || null;
        this.maxNode = this.nodeSet.types.length - 1;
        this.dialect = this.parseDialect();
        this.top = this.topRules[Object.keys(this.topRules)[0]];
    }
    createParse(input, fragments, ranges) {
        let parse = new parse_Parse(this, input, fragments, ranges);
        for (let w of this.wrappers)
            parse = w(parse, input, fragments, ranges);
        return parse;
    }
    getGoto(state, term, loose = false) {
        let table = this.goto;
        if (term >= table[0])
            return -1;
        for (let pos = table[term + 1];;) {
            let groupTag = table[pos++], last = groupTag & 1;
            let target = table[pos++];
            if (last && loose)
                return target;
            for (let end = pos + (groupTag >> 1); pos < end; pos++)
                if (table[pos] == state)
                    return target;
            if (last)
                return -1;
        }
    }
    hasAction(state, terminal) {
        let data = this.data;
        for (let set = 0; set < 2; set++) {
            for (let i = this.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */), next;; i += 3) {
                if ((next = data[i]) == 65535 /* End */) {
                    if (data[i + 1] == 1 /* Next */)
                        next = data[i = pair(data, i + 2)];
                    else if (data[i + 1] == 2 /* Other */)
                        return pair(data, i + 2);
                    else
                        break;
                }
                if (next == terminal || next == 0 /* Err */)
                    return pair(data, i + 1);
            }
        }
        return 0;
    }
    // @internal
    stateSlot(state, slot) {
        return this.states[(state * 6 /* Size */) + slot];
    }
    // @internal
    stateFlag(state, flag) {
        return (this.stateSlot(state, 0 /* Flags */) & flag) > 0;
    }
    // @internal
    validAction(state, action) {
        if (action == this.stateSlot(state, 4 /* DefaultReduce */))
            return true;
        for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
            if (this.data[i] == 65535 /* End */) {
                if (this.data[i + 1] == 1 /* Next */)
                    i = pair(this.data, i + 2);
                else
                    return false;
            }
            if (action == pair(this.data, i + 1))
                return true;
        }
    }
    nextStates(state) {
        let result = [];
        for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
            if (this.data[i] == 65535 /* End */) {
                if (this.data[i + 1] == 1 /* Next */)
                    i = pair(this.data, i + 2);
                else
                    break;
            }
            if ((this.data[i + 2] & (65536 /* ReduceFlag */ >> 16)) == 0) {
                let value = this.data[i + 1];
                if (!result.some((v, i) => (i & 1) && v == value))
                    result.push(this.data[i], value);
            }
        }
        return result;
    }
    // @internal
    overrides(token, prev) {
        let iPrev = findOffset(this.data, this.tokenPrecTable, prev);
        return iPrev < 0 || findOffset(this.data, this.tokenPrecTable, token) < iPrev;
    }
    configure(config) {
        // Hideous reflection-based kludge to make it easy to create a
        // slightly modified copy of a parser.
        let copy = Object.assign(Object.create(LRParser.prototype), this);
        if (config.props)
            copy.nodeSet = this.nodeSet.extend(...config.props);
        if (config.top) {
            let info = this.topRules[config.top];
            if (!info)
                throw new RangeError(`Invalid top rule name ${config.top}`);
            copy.top = info;
        }
        if (config.tokenizers)
            copy.tokenizers = this.tokenizers.map(t => {
                let found = config.tokenizers.find(r => r.from == t);
                return found ? found.to : t;
            });
        if (config.contextTracker)
            copy.context = config.contextTracker;
        if (config.dialect)
            copy.dialect = this.parseDialect(config.dialect);
        if (config.strict != null)
            copy.strict = config.strict;
        if (config.wrap)
            copy.wrappers = copy.wrappers.concat(config.wrap);
        if (config.bufferLength != null)
            copy.bufferLength = config.bufferLength;
        return copy;
    }
    hasWrappers() {
        return this.wrappers.length > 0;
    }
    getName(term) {
        return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
    }
    get eofTerm() { return this.maxNode + 1; }
    get topNode() { return this.nodeSet.types[this.top[1]]; }
    // @internal
    dynamicPrecedence(term) {
        let prec = this.dynamicPrecedences;
        return prec == null ? 0 : prec[term] || 0;
    }
    // @internal
    parseDialect(dialect) {
        let values = Object.keys(this.dialects), flags = values.map(() => false);
        if (dialect)
            for (let part of dialect.split(" ")) {
                let id = values.indexOf(part);
                if (id >= 0)
                    flags[id] = true;
            }
        let disabled = null;
        for (let i = 0; i < values.length; i++)
            if (!flags[i]) {
                for (let j = this.dialects[values[i]], id; (id = this.data[j++]) != 65535 /* End */;)
                    (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id] = 1;
            }
        return new Dialect(dialect, flags, disabled);
    }
    static deserialize(spec) {
        return new LRParser(spec);
    }
}
function pair(data, off) { return data[off] | (data[off + 1] << 16); }
function findOffset(data, start, term) {
    for (let i = start, next; (next = data[i]) != 65535 /* End */; i++)
        if (next == term)
            return i - start;
    return -1;
}
function findFinished(stacks) {
    let best = null;
    for (let stack of stacks) {
        let stopped = stack.p.stoppedAt;
        if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) &&
            stack.p.parser.stateFlag(stack.state, 2 /* Accepting */) &&
            (!best || best.score < stack.score))
            best = stack;
    }
    return best;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/lezer/lr/index.js




;// CONCATENATED MODULE: ./sys/public/js/editor/dist/javascript.js







// This file was generated by lezer-generator. You probably shouldn't edit it.
const noSemi = 281,
      incdec = 1,
      incdecPrefix = 2,
      templateContent = 282,
      InterpolationStart = 3,
      templateEnd = 283,
      insertSemi = 284,
      TSExtends = 4,
      spaces = 286,
      newline = 287,
      LineComment = 5,
      BlockComment = 6,
      Dialect_ts = 1;

/* Hand-written tokenizers for JavaScript tokens that can't be
   expressed by lezer's built-in tokenizer. */

const space = [9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288];

const braceR = 125, braceL = 123, semicolon = 59, slash = 47, star = 42, plus = 43, minus = 45, dollar = 36, backtick = 96, backslash = 92;

const trackNewline = new ContextTracker({
    start: false,
    shift(context, term) {
        return term == LineComment || term == BlockComment || term == spaces ? context : term == newline
    },
    strict: false
});

const insertSemicolon = new ExternalTokenizer((input, stack) => {
    let {next} = input;
    if ((next == braceR || next == -1 || stack.context) && stack.canShift(insertSemi))
        input.acceptToken(insertSemi);
}, {contextual: true, fallback: true});

const noSemicolon = new ExternalTokenizer((input, stack) => {
    let {next} = input, after;
    if (space.indexOf(next) > -1) return
    if (next == slash && ((after = input.peek(1)) == slash || after == star)) return
    if (next != braceR && next != semicolon && next != -1 && !stack.context && stack.canShift(noSemi))
        input.acceptToken(noSemi);
}, {contextual: true});

const incdecToken = new ExternalTokenizer((input, stack) => {
    let {next} = input;
    if (next == plus || next == minus) {
        input.advance();
        if (next == input.next) {
            input.advance();
            let mayPostfix = !stack.context && stack.canShift(incdec);
            input.acceptToken(mayPostfix ? incdec : incdecPrefix);
        }
    }
}, {contextual: true});

const template = new ExternalTokenizer(input => {
    for (let afterDollar = false, i = 0;; i++) {
        let {next} = input;
        if (next < 0) {
            if (i) input.acceptToken(templateContent);
            break
        } else if (next == backtick) {
            if (i) input.acceptToken(templateContent);
            else input.acceptToken(templateEnd, 1);
            break
        } else if (next == braceL && afterDollar) {
            if (i == 1) input.acceptToken(InterpolationStart, 1);
            else input.acceptToken(templateContent, -1);
            break
        } else if (next == 10 /* "\n" */ && i) {
            // Break up template strings on lines, to avoid huge tokens
            input.advance();
            input.acceptToken(templateContent);
            break
        } else if (next == backslash) {
            input.advance();
        }
        afterDollar = next == dollar;
        input.advance();
    }
});

function tsExtends(value, stack) {
    return value == "extends" && stack.dialectEnabled(Dialect_ts) ? TSExtends : -1
}

const jsHighlight = styleTags({
    "get set async static": tags.modifier,
    "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
    "in of await yield void typeof delete instanceof": tags.operatorKeyword,
    "let var const function class extends": tags.definitionKeyword,
    "import export from": tags.moduleKeyword,
    "with debugger as new": tags.keyword,
    TemplateString: tags.special(tags.string),
    Super: tags.atom,
    BooleanLiteral: tags.bool,
    this: tags.self,
    null: tags["null"],
    Star: tags.modifier,
    VariableName: tags.variableName,
    "CallExpression/VariableName TaggedTemplateExpression/VariableName": tags["function"](tags.variableName),
    VariableDefinition: tags.definition(tags.variableName),
    Label: tags.labelName,
    PropertyName: tags.propertyName,
    PrivatePropertyName: tags.special(tags.propertyName),
    "CallExpression/MemberExpression/PropertyName": tags["function"](tags.propertyName),
    "FunctionDeclaration/VariableDefinition": tags["function"](tags.definition(tags.variableName)),
    "ClassDeclaration/VariableDefinition": tags.definition(tags.className),
    PropertyDefinition: tags.definition(tags.propertyName),
    PrivatePropertyDefinition: tags.definition(tags.special(tags.propertyName)),
    UpdateOp: tags.updateOperator,
    LineComment: tags.lineComment,
    BlockComment: tags.blockComment,
    Number: tags.number,
    String: tags.string,
    ArithOp: tags.arithmeticOperator,
    LogicOp: tags.logicOperator,
    BitOp: tags.bitwiseOperator,
    CompareOp: tags.compareOperator,
    RegExp: tags.regexp,
    Equals: tags.definitionOperator,
    "Arrow : Spread": tags.punctuation,
    "( )": tags.paren,
    "[ ]": tags.squareBracket,
    "{ }": tags.brace,
    "InterpolationStart InterpolationEnd": tags.special(tags.brace),
    ".": tags.derefOperator,
    ", ;": tags.separator,

    TypeName: tags.typeName,
    TypeDefinition: tags.definition(tags.typeName),
    "type enum interface implements namespace module declare": tags.definitionKeyword,
    "abstract global Privacy readonly override": tags.modifier,
    "is keyof unique infer": tags.operatorKeyword,

    JSXAttributeValue: tags.attributeValue,
    JSXText: tags.content,
    "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
    "JSXIdentifier JSXNameSpacedName": tags.tagName,
    "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.attributeName
});

// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_identifier = {__proto__:null,export:18, as:23, from:29, default:32, async:37, function:38, this:48, true:56, false:56, void:66, typeof:70, null:86, super:88, new:122, await:139, yield:141, delete:142, class:152, extends:154, public:197, private:197, protected:197, readonly:199, instanceof:220, in:222, const:224, import:256, keyof:307, unique:311, infer:317, is:351, abstract:371, implements:373, type:375, let:378, var:380, interface:387, enum:391, namespace:397, module:399, declare:403, global:407, for:428, of:437, while:440, with:444, do:448, if:452, else:454, switch:458, case:464, try:470, catch:474, finally:478, return:482, throw:486, break:490, continue:494, debugger:498};
const spec_word = {__proto__:null,async:109, get:111, set:113, public:161, private:161, protected:161, static:163, abstract:165, override:167, readonly:173, new:355};
const spec_LessThan = {__proto__:null,"<":129};
const parser = LRParser.deserialize({
  version: 14,
  states: "$4|O`QYOOO'QQ$IfO'#ChO'XOSO'#DVO)dQYO'#D]O)tQYO'#DhO){QYO'#DrO-xQYO'#DxOOQO'#E]'#E]O.]QWO'#E[O.bQWO'#E[OOQ$IU'#Ef'#EfO0aQ$IfO'#ItO2wQ$IfO'#IuO3eQWO'#EzO3jQpO'#FaOOQ$IU'#FS'#FSO3rO!bO'#FSO4QQWO'#FhO5_QWO'#FgOOQ$IU'#Iu'#IuOOQ$IS'#It'#ItOOQQ'#J^'#J^O5dQWO'#HpO5iQ$I[O'#HqOOQQ'#Ih'#IhOOQQ'#Hr'#HrQ`QYOOO){QYO'#DjO5qQWO'#G[O5vQ#tO'#CmO6UQWO'#EZO6aQWO'#EgO6fQ#tO'#FRO7QQWO'#G[O7VQWO'#G`O7bQWO'#G`O7pQWO'#GcO7pQWO'#GdO7pQWO'#GfO5qQWO'#GiO8aQWO'#GlO9oQWO'#CdO:PQWO'#GyO:XQWO'#HPO:XQWO'#HRO`QYO'#HTO:XQWO'#HVO:XQWO'#HYO:^QWO'#H`O:cQ$I]O'#HfO){QYO'#HhO:nQ$I]O'#HjO:yQ$I]O'#HlO5iQ$I[O'#HnO){QYO'#DWOOOS'#Ht'#HtO;UOSO,59qOOQ$IU,59q,59qO=gQbO'#ChO=qQYO'#HuO>UQWO'#IvO@TQbO'#IvO'dQYO'#IvO@[QWO,59wO@rQ&jO'#DbOAkQWO'#E]OAxQWO'#JROBTQWO'#JQOBTQWO'#JQOB]QWO,5:yOBbQWO'#JPOBiQWO'#DyO5vQ#tO'#EZOBwQWO'#EZOCSQ`O'#FROOQ$IU,5:S,5:SOC[QYO,5:SOEYQ$IfO,5:^OEvQWO,5:dOFaQ$I[O'#JOO7VQWO'#I}OFhQWO'#I}OFpQWO,5:xOFuQWO'#I}OGTQYO,5:vOITQWO'#EWOJ_QWO,5:vOKnQWO'#DlOKuQYO'#DqOLPQ&jO,5;PO){QYO,5;POOQQ'#Er'#ErOOQQ'#Et'#EtO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;RO){QYO,5;ROOQQ'#Ex'#ExOLXQYO,5;cOOQ$IU,5;h,5;hOOQ$IU,5;i,5;iONXQWO,5;iOOQ$IU,5;j,5;jO){QYO'#IPON^Q$I[O,5<TONxQWO,5;RO){QYO,5;fO! bQpO'#JVO! PQpO'#JVO! iQpO'#JVO! zQpO,5;qOOOO,5;{,5;{O!!YQYO'#FcOOOO'#IO'#IOO3rO!bO,5;nO!!aQpO'#FeOOQ$IU,5;n,5;nO!!}Q,UO'#CrOOQ$IU'#Cu'#CuO!#bQWO'#CuO!#gOSO'#CyO!$TQ#tO,5<QO!$[QWO,5<SO!%hQWO'#FrO!%uQWO'#FsO!%zQWO'#FwO!&yQ&jO'#F{O!'lQ,UO'#IqOOQ$IU'#Iq'#IqO!'vQWO'#IpO!(UQWO'#IoOOQ$IU'#Cs'#CsOOQ$IU'#C|'#C|O!(^QWO'#DOOJdQWO'#FjOJdQWO'#FlO!(cQWO'#FnO!(hQWO'#FoO!(mQWO'#FuOJdQWO'#FzO!(rQWO'#E^O!)ZQWO,5<RO`QYO,5>[OOQQ'#Ik'#IkOOQQ,5>],5>]OOQQ-E;p-E;pO!+VQ$IfO,5:UOOQ$IS'#Cp'#CpO!+vQ#tO,5<vOOQO'#Cf'#CfO!,XQWO'#CqO!,aQ$I[O'#IlO5_QWO'#IlO:^QWO,59XO!,rQpO,59XO!,zQ#tO,59XO5vQ#tO,59XO!-VQWO,5:vO!-_QWO'#GxO!-mQWO'#JbO){QYO,5;kO!-uQ&jO,5;mO!-zQWO,5=cO!.PQWO,5=cO!.UQWO,5=cO5iQ$I[O,5=cO5qQWO,5<vO!.dQWO'#E_O!.xQ&jO'#E`OOQ$IS'#JP'#JPO!/ZQ$I[O'#J_O5iQ$I[O,5<zO7pQWO,5=QOOQO'#Cr'#CrO!/fQpO,5<}O!/nQ#tO,5=OO!/yQWO,5=QO!0OQ`O,5=TO:^QWO'#GnO5qQWO'#GpO!0WQWO'#GpO5vQ#tO'#GsO!0]QWO'#GsOOQQ,5=W,5=WO!0bQWO'#GtO!0jQWO'#CmO!0oQWO,59OO!0yQWO,59OO!2{QYO,59OOOQQ,59O,59OO!3YQ$I[O,59OO){QYO,59OO!3eQYO'#G{OOQQ'#G|'#G|OOQQ'#G}'#G}O`QYO,5=eO!3uQWO,5=eO){QYO'#DxO`QYO,5=kO`QYO,5=mO!3zQWO,5=oO`QYO,5=qO!4PQWO,5=tO!4UQYO,5=zOOQQ,5>Q,5>QO){QYO,5>QO5iQ$I[O,5>SOOQQ,5>U,5>UO!8VQWO,5>UOOQQ,5>W,5>WO!8VQWO,5>WOOQQ,5>Y,5>YO!8[Q`O,59rOOOS-E;r-E;rOOQ$IU1G/]1G/]O!8aQbO,5>aO'dQYO,5>aOOQO,5>f,5>fO!8kQYO'#HuOOQO-E;s-E;sO!8xQWO,5?bO!9QQbO,5?bO!9XQWO,5?lOOQ$IU1G/c1G/cO!9aQpO'#DTOOQO'#Ix'#IxO){QYO'#IxO!:OQpO'#IxO!:mQpO'#DcO!;OQ&jO'#DcO!=ZQYO'#DcO!=bQWO'#IwO!=jQWO,59|O!=oQWO'#EaO!=}QWO'#JSO!>VQWO,5:zO!>mQ&jO'#DcO){QYO,5?mO!>wQWO'#HzOOQO-E;x-E;xO!9XQWO,5?lOOQ$IS1G0e1G0eO!@TQ&jO'#D|OOQ$IU,5:e,5:eO){QYO,5:eOITQWO,5:eO!@[QWO,5:eO:^QWO,5:uO!,rQpO,5:uO!,zQ#tO,5:uO5vQ#tO,5:uOOQ$IU1G/n1G/nOOQ$IU1G0O1G0OOOQ$IS'#EV'#EVO){QYO,5?jO!@gQ$I[O,5?jO!@xQ$I[O,5?jO!APQWO,5?iO!AXQWO'#H|O!APQWO,5?iOOQ$IS1G0d1G0dO7VQWO,5?iOOQ$IU1G0b1G0bO!AsQ$IfO1G0bO!BdQ$IdO,5:rOOQ$IU'#Fq'#FqO!CQQ$IfO'#IqOGTQYO1G0bO!EPQ#tO'#IyO!EZQWO,5:WO!E`QbO'#IzO){QYO'#IzO!EjQWO,5:]OOQ$IU'#DT'#DTOOQ$IU1G0k1G0kO!EoQWO1G0kO!HQQ$IfO1G0mO!HXQ$IfO1G0mO!JlQ$IfO1G0mO!JsQ$IfO1G0mO!LzQ$IfO1G0mO!M_Q$IfO1G0mO#!OQ$IfO1G0mO#!VQ$IfO1G0mO#$jQ$IfO1G0mO#$qQ$IfO1G0mO#&fQ$IfO1G0mO#)`Q7^O'#ChO#+ZQ7^O1G0}O#-UQ7^O'#IuOOQ$IU1G1T1G1TO#-iQ$IfO,5>kOOQ$IS-E;}-E;}O#.YQ$IfO1G0mOOQ$IU1G0m1G0mO#0[Q$IfO1G1QO#0{QpO,5;sO#1QQpO,5;tO#1VQpO'#F[O#1kQWO'#FZOOQO'#JW'#JWOOQO'#H}'#H}O#1pQpO1G1]OOQ$IU1G1]1G1]OOOO1G1f1G1fO#2OQ7^O'#ItO#2YQWO,5;}OLXQYO,5;}OOOO-E;|-E;|OOQ$IU1G1Y1G1YOOQ$IU,5<P,5<PO#2_QpO,5<POOQ$IU,59a,59aOITQWO'#C{OOOS'#Hs'#HsO#2dOSO,59eOOQ$IU,59e,59eO){QYO1G1lO!(hQWO'#IRO#2oQWO,5<eOOQ$IU,5<b,5<bOOQO'#GV'#GVOJdQWO,5<pOOQO'#GX'#GXOJdQWO,5<rOJdQWO,5<tOOQO1G1n1G1nO#2zQ`O'#CpO#3_Q`O,5<^O#3fQWO'#JZO5qQWO'#JZO#3tQWO,5<`OJdQWO,5<_O#3yQ`O'#FqO#4WQ`O'#J[O#4bQWO'#J[OITQWO'#J[O#4gQWO,5<cOOQ$IS'#Dg'#DgO#4lQWO'#FtO#4wQpO'#F|O!&tQ&jO'#F|O!&tQ&jO'#GOO#5YQWO'#GPO!(mQWO'#GSO#5_Q$I[O'#ITO#5jQ&jO,5<gOOQ$IU,5<g,5<gO#5qQ&jO'#F|O#6PQ&jO'#F}O#6XQ&jO'#F}OOQ$IU,5<u,5<uOJdQWO,5?[OJdQWO,5?[O#6^QWO'#IUO#6iQWO,5?ZOOQ$IU'#Ch'#ChO#7]Q#tO,59jOOQ$IU,59j,59jO#8OQ#tO,5<UO#8qQ#tO,5<WO#8{QWO,5<YOOQ$IU,5<Z,5<ZO#9QQWO,5<aO#9VQ#tO,5<fOGTQYO1G1mO#9gQWO1G1mOOQQ1G3v1G3vOOQ$IU1G/p1G/pONXQWO1G/pOOQQ1G2b1G2bOITQWO1G2bO){QYO1G2bOITQWO1G2bO#9lQWO1G2bO#9zQWO,59]O#;TQWO'#EWOOQ$IS,5?W,5?WO#;_Q$I[O,5?WOOQQ1G.s1G.sO:^QWO1G.sO!,rQpO1G.sO!,zQ#tO1G.sO#;pQWO1G0bO#;uQWO'#ChO#<QQWO'#JcO#<YQWO,5=dO#<_QWO'#JcO#<dQWO'#JcO#<lQWO'#I^O#<zQWO,5?|O#=SQbO1G1VOOQ$IU1G1X1G1XO5qQWO1G2}O#=ZQWO1G2}O#=`QWO1G2}O#=eQWO1G2}OOQQ1G2}1G2}O#=jQ#tO1G2bO7VQWO'#JQO7VQWO'#EaO7VQWO'#IWO#={Q$I[O,5?yOOQQ1G2f1G2fO!/yQWO1G2lOITQWO1G2iO#>WQWO1G2iOOQQ1G2j1G2jOITQWO1G2jO#>]QWO1G2jO#>eQ&jO'#GhOOQQ1G2l1G2lO!&tQ&jO'#IYO!0OQ`O1G2oOOQQ1G2o1G2oOOQQ,5=Y,5=YO#>mQ#tO,5=[O5qQWO,5=[O#5YQWO,5=_O5_QWO,5=_O!,rQpO,5=_O!,zQ#tO,5=_O5vQ#tO,5=_O#?OQWO'#JaO#?ZQWO,5=`OOQQ1G.j1G.jO#?`Q$I[O1G.jO#?kQWO1G.jO#?pQWO1G.jO5iQ$I[O1G.jO#?xQbO,5@OO#@SQWO,5@OO#@_QYO,5=gO#@fQWO,5=gO7VQWO,5@OOOQQ1G3P1G3PO`QYO1G3POOQQ1G3V1G3VOOQQ1G3X1G3XO:XQWO1G3ZO#@kQYO1G3]O#DfQYO'#H[OOQQ1G3`1G3`O#DsQWO'#HbO:^QWO'#HdOOQQ1G3f1G3fO#D{QYO1G3fO5iQ$I[O1G3lOOQQ1G3n1G3nOOQ$IS'#Fx'#FxO5iQ$I[O1G3pO5iQ$I[O1G3rOOOS1G/^1G/^O#HyQ`O,5<TO#IRQbO1G3{OOQO1G4Q1G4QO){QYO,5>aO#I]QWO1G4|O#IeQWO1G5WO#ImQWO,5?dOLXQYO,5:{O7VQWO,5:{O:^QWO,59}OLXQYO,59}O!,rQpO,59}O#IrQ7^O,59}OOQO,5:{,5:{O#I|Q&jO'#HvO#JdQWO,5?cOOQ$IU1G/h1G/hO#JlQ&jO'#H{O#KQQWO,5?nOOQ$IS1G0f1G0fO!;OQ&jO,59}O#KYQbO1G5XO7VQWO,5>fOOQ$IS'#ES'#ESO#KdQ$ItO'#ETO!?{Q&jO'#D}OOQO'#Hy'#HyO#LOQ&jO,5:hOOQ$IU,5:h,5:hO#LVQ&jO'#D}O#LhQ&jO'#D}O#LoQ&jO'#EYO#LrQ&jO'#ETO#MPQ&jO'#ETO!?{Q&jO'#ETO#MdQWO1G0PO#MiQ`O1G0POOQ$IU1G0P1G0PO){QYO1G0POITQWO1G0POOQ$IU1G0a1G0aO:^QWO1G0aO!,rQpO1G0aO!,zQ#tO1G0aO#MpQ$IfO1G5UO){QYO1G5UO#NQQ$I[O1G5UO#NcQWO1G5TO7VQWO,5>hOOQO,5>h,5>hO#NkQWO,5>hOOQO-E;z-E;zO#NcQWO1G5TO#NyQ$IfO,59jO$!xQ$IfO,5<UO$$zQ$IfO,5<WO$&|Q$IfO,5<fOOQ$IU7+%|7+%|O$)UQ$IfO7+%|O$)uQWO'#HwO$*PQWO,5?eOOQ$IU1G/r1G/rO$*XQYO'#HxO$*fQWO,5?fO$*nQbO,5?fOOQ$IU1G/w1G/wOOQ$IU7+&V7+&VO$*xQ7^O,5:^O){QYO7+&iO$+SQ7^O,5:UOOQO1G1_1G1_OOQO1G1`1G1`O$+aQMhO,5;vOLXQYO,5;uOOQO-E;{-E;{OOQ$IU7+&w7+&wOOOO7+'Q7+'QOOOO1G1i1G1iO$+lQWO1G1iOOQ$IU1G1k1G1kO$+qQ`O,59gOOOS-E;q-E;qOOQ$IU1G/P1G/PO$+xQ$IfO7+'WOOQ$IU,5>m,5>mO$,iQWO,5>mOOQ$IU1G2P1G2PP$,nQWO'#IRPOQ$IU-E<P-E<PO$-_Q#tO1G2[O$.QQ#tO1G2^O$.[Q#tO1G2`OOQ$IU1G1x1G1xO$.cQWO'#IQO$.qQWO,5?uO$.qQWO,5?uO$.yQWO,5?uO$/UQWO,5?uOOQO1G1z1G1zO$/dQ#tO1G1yO$/tQWO'#ISO$0UQWO,5?vOITQWO,5?vO$0^Q`O,5?vOOQ$IU1G1}1G1}OOQ$IS,5<h,5<hOOQ$IS,5<i,5<iO$0hQWO,5<iO#5TQWO,5<iO!,rQpO,5<hO$0mQWO,5<jOOQ$IS,5<k,5<kO$0hQWO,5<nOOQO,5>o,5>oOOQO-E<R-E<ROOQ$IU1G2R1G2RO!&tQ&jO,5<hO$0uQWO,5<iO!&tQ&jO,5<jO!&tQ&jO,5<iO$1QQ#tO1G4vO$1[Q#tO1G4vOOQO,5>p,5>pOOQO-E<S-E<SO!-uQ&jO,59lO){QYO,59lO$1iQWO1G1tOJdQWO1G1{O$1nQ$IfO7+'XOOQ$IU7+'X7+'XOGTQYO7+'XOOQ$IU7+%[7+%[O$2_Q`O'#J]O#MdQWO7+'|O$2iQWO7+'|O$2qQ`O7+'|OOQQ7+'|7+'|OITQWO7+'|O){QYO7+'|OITQWO7+'|OOQO1G.w1G.wO$2{Q$IdO'#ChO$3`Q$IdO,5<lO$4QQWO,5<lOOQ$IS1G4r1G4rOOQQ7+$_7+$_O:^QWO7+$_O!,rQpO7+$_OGTQYO7+%|O$4VQWO'#I]O$4hQWO,5?}OOQO1G3O1G3OO5qQWO,5?}O$4hQWO,5?}O$4pQWO,5?}OOQO,5>x,5>xOOQO-E<[-E<[OOQ$IU7+&q7+&qO$4uQWO7+(iO5iQ$I[O7+(iO5qQWO7+(iO$4zQWO7+(iO$5PQWO7+'|OOQ$IS,5>r,5>rOOQ$IS-E<U-E<UOOQQ7+(W7+(WO$5_Q$IdO7+(TOITQWO7+(TO$5iQ`O7+(UOOQQ7+(U7+(UOITQWO7+(UO$5pQWO'#J`O$5{QWO,5=SOOQO,5>t,5>tOOQO-E<W-E<WOOQQ7+(Z7+(ZO$6uQ&jO'#GqOOQQ1G2v1G2vOITQWO1G2vO){QYO1G2vOITQWO1G2vO$6|QWO1G2vO$7[Q#tO1G2vO5iQ$I[O1G2yO#5YQWO1G2yO5_QWO1G2yO!,rQpO1G2yO!,zQ#tO1G2yO$7mQWO'#I[O$7xQWO,5?{O$8QQ&jO,5?{OOQ$IS1G2z1G2zOOQQ7+$U7+$UO$8YQWO7+$UO5iQ$I[O7+$UO$8_QWO7+$UO){QYO1G5jO){QYO1G5kO$8dQYO1G3RO$8kQWO1G3RO$8pQYO1G3RO$8wQ$I[O1G5jOOQQ7+(k7+(kO5iQ$I[O7+(uO`QYO7+(wOOQQ'#Jf'#JfOOQQ'#I_'#I_O$9RQYO,5=vOOQQ,5=v,5=vO){QYO'#H]O$9`QWO'#H_OOQQ,5=|,5=|O7VQWO,5=|OOQQ,5>O,5>OOOQQ7+)Q7+)QOOQQ7+)W7+)WOOQQ7+)[7+)[OOQQ7+)^7+)^OOQO1G5O1G5OO$9eQ7^O1G0gO$9oQWO1G0gOOQO1G/i1G/iO$9zQ7^O1G/iO:^QWO1G/iOLXQYO'#DcOOQO,5>b,5>bOOQO-E;t-E;tOOQO,5>g,5>gOOQO-E;y-E;yO!,rQpO1G/iO:^QWO,5:iOOQO,5:o,5:oO){QYO,5:oO$:UQ$I[O,5:oO$:aQ$I[O,5:oO!,rQpO,5:iOOQO-E;w-E;wOOQ$IU1G0S1G0SO!?{Q&jO,5:iO$:oQ&jO,5:iO$;QQ$ItO,5:oO$;lQ&jO,5:iO!?{Q&jO,5:oOOQO,5:t,5:tO$;sQ&jO,5:oO$<QQ$I[O,5:oOOQ$IU7+%k7+%kO#MdQWO7+%kO#MiQ`O7+%kOOQ$IU7+%{7+%{O:^QWO7+%{O!,rQpO7+%{O$<fQ$IfO7+*pO){QYO7+*pOOQO1G4S1G4SO7VQWO1G4SO$<vQWO7+*oO$=OQ$IfO1G2[O$?QQ$IfO1G2^O$ASQ$IfO1G1yO$C[Q#tO,5>cOOQO-E;u-E;uO$CfQbO,5>dO){QYO,5>dOOQO-E;v-E;vO$CpQWO1G5QO$CxQ7^O1G0bO$FPQ7^O1G0mO$FWQ7^O1G0mO$HXQ7^O1G0mO$H`Q7^O1G0mO$JTQ7^O1G0mO$JhQ7^O1G0mO$LuQ7^O1G0mO$L|Q7^O1G0mO$N}Q7^O1G0mO% UQ7^O1G0mO%!yQ7^O1G0mO%#^Q$IfO<<JTO%#}Q7^O1G0mO%&UQ7^O'#IqO%'nQ7^O1G1QOLXQYO'#F^OOQO'#JX'#JXOOQO1G1b1G1bO%'{QWO1G1aO%(QQ7^O,5>kOOOO7+'T7+'TOOOS1G/R1G/ROOQ$IU1G4X1G4XOJdQWO7+'zO%([QWO,5>lO5qQWO,5>lOOQO-E<O-E<OO%(jQWO1G5aO%(jQWO1G5aO%(rQWO1G5aO%(}Q`O,5>nO%)XQWO,5>nOITQWO,5>nOOQO-E<Q-E<QO%)^Q`O1G5bO%)hQWO1G5bOOQ$IS1G2T1G2TO$0hQWO1G2TOOQ$IS1G2S1G2SO%)pQWO1G2UOITQWO1G2UOOQ$IS1G2Y1G2YO!,rQpO1G2SO#5TQWO1G2TO%)uQWO1G2UO%)}QWO1G2TOJdQWO7+*bOOQ$IU1G/W1G/WO%*YQWO1G/WOOQ$IU7+'`7+'`O%*_Q#tO7+'gO%*oQ$IfO<<JsOOQ$IU<<Js<<JsOITQWO'#IVO%+`QWO,5?wOOQQ<<Kh<<KhOITQWO<<KhO#MdQWO<<KhO%+hQWO<<KhO%+pQ`O<<KhOITQWO1G2WOOQQ<<Gy<<GyO:^QWO<<GyO%+zQ$IfO<<IhOOQ$IU<<Ih<<IhOOQO,5>w,5>wO%,kQWO,5>wO%,pQWO,5>wOOQO-E<Z-E<ZO%,xQWO1G5iO%,xQWO1G5iO5qQWO1G5iO%-QQWO<<LTOOQQ<<LT<<LTO%-VQWO<<LTO5iQ$I[O<<LTO){QYO<<KhOITQWO<<KhOOQQ<<Ko<<KoO$5_Q$IdO<<KoOOQQ<<Kp<<KpO$5iQ`O<<KpO%-[Q&jO'#IXO%-gQWO,5?zOLXQYO,5?zOOQQ1G2n1G2nO#KdQ$ItO'#ETO!?{Q&jO'#GrOOQO'#IZ'#IZO%-oQ&jO,5=]OOQQ,5=],5=]O%-vQ&jO'#ETO%.RQ&jO'#ETO%.jQ&jO'#ETO%.tQ&jO'#GrO%/VQWO7+(bO%/[QWO7+(bO%/dQ`O7+(bOOQQ7+(b7+(bOITQWO7+(bO){QYO7+(bOITQWO7+(bO%/nQWO7+(bOOQQ7+(e7+(eO5iQ$I[O7+(eO#5YQWO7+(eO5_QWO7+(eO!,rQpO7+(eO%/|QWO,5>vOOQO-E<Y-E<YOOQO'#Gu'#GuO%0XQWO1G5gO5iQ$I[O<<GpOOQQ<<Gp<<GpO%0aQWO<<GpO%0fQWO7++UO%0kQWO7++VOOQQ7+(m7+(mO%0pQWO7+(mO%0uQYO7+(mO%0|QWO7+(mO){QYO7++UO){QYO7++VOOQQ<<La<<LaOOQQ<<Lc<<LcOOQQ-E<]-E<]OOQQ1G3b1G3bO%1RQWO,5=wOOQQ,5=y,5=yO%1WQWO1G3hOLXQYO7+&ROOQO7+%T7+%TO%1]Q7^O1G5XO:^QWO7+%TOOQO1G0T1G0TO%1gQ$IfO1G0ZOOQO1G0Z1G0ZO){QYO1G0ZO%1qQ$I[O1G0ZO:^QWO1G0TO!,rQpO1G0TO!?{Q&jO1G0TO%1|Q$I[O1G0ZO%2[Q&jO1G0TO%2mQ$I[O1G0ZO%3RQ$ItO1G0ZO%3]Q&jO1G0TO!?{Q&jO1G0ZOOQ$IU<<IV<<IVOOQ$IU<<Ig<<IgO:^QWO<<IgO%3dQ$IfO<<N[OOQO7+)n7+)nO%3tQ$IfO7+'gO%5|QbO1G4OO%6WQ7^O7+%|O%6|Q7^O,59jO%8zQ7^O,5<UO%:{Q7^O,5<WO%<hQ7^O,5<fO%>WQ7^O7+'WO%>eQ7^O7+'XO%>rQWO,5;xOOQO7+&{7+&{O%>wQ#tO<<KfOOQO1G4W1G4WO%?XQWO1G4WO%?dQWO1G4WO%?rQWO7+*{O%?rQWO7+*{OITQWO1G4YO%?zQ`O1G4YO%@UQWO7+*|OOQ$IS7+'o7+'oO$0hQWO7+'pO%@^Q`O7+'pOOQ$IS7+'n7+'nO$0hQWO7+'oO%@eQWO7+'pOITQWO7+'pO#5TQWO7+'oO%@jQ#tO<<M|OOQ$IU7+$r7+$rO%@tQ`O,5>qOOQO-E<T-E<TO#MdQWOANASOOQQANASANASOITQWOANASO%AOQ$IdO7+'rOOQQAN=eAN=eO5qQWO1G4cOOQO1G4c1G4cO%A`QWO1G4cO%AeQWO7++TO%AeQWO7++TO5iQ$I[OANAoO%AmQWOANAoOOQQANAoANAoO%ArQWOANASO%AzQ`OANASOOQQANAZANAZOOQQANA[ANA[O%BUQWO,5>sOOQO-E<V-E<VO%BaQ7^O1G5fO#5YQWO,5=^O5_QWO,5=^O!,rQpO,5=^OOQO-E<X-E<XOOQQ1G2w1G2wO$;QQ$ItO,5:oO!?{Q&jO,5=^O%BkQ&jO,5=^O%B|Q&jO,5:oOOQQ<<K|<<K|OITQWO<<K|O%/VQWO<<K|O%CWQWO<<K|O%C`Q`O<<K|O){QYO<<K|OITQWO<<K|OOQQ<<LP<<LPO5iQ$I[O<<LPO#5YQWO<<LPO5_QWO<<LPO%CjQ&jO1G4bO%CrQWO7++ROOQQAN=[AN=[O5iQ$I[OAN=[OOQQ<<Np<<NpOOQQ<<Nq<<NqOOQQ<<LX<<LXO%CzQWO<<LXO%DPQYO<<LXO%DWQWO<<NpO%D]QWO<<NqOOQQ1G3c1G3cO:^QWO7+)SO%DbQ7^O<<ImOOQO<<Ho<<HoOOQO7+%u7+%uO%1gQ$IfO7+%uO){QYO7+%uOOQO7+%o7+%oO:^QWO7+%oO!,rQpO7+%oO%DlQ$I[O7+%uO!?{Q&jO7+%oO%DwQ$I[O7+%uO%EVQ&jO7+%oO%EhQ$I[O7+%uOOQ$IUAN?RAN?RO%E|Q$IfO<<KfO%HUQ7^O<<JTO%HcQ7^O1G1yO%JgQ7^O1G2[O%LhQ7^O1G2^O%NTQ7^O<<JsO%NbQ7^O<<IhOOQO1G1d1G1dOOQO7+)r7+)rO%NoQWO7+)rO%NzQWO<<NgO& SQ`O7+)tOOQ$IS<<K[<<K[O$0hQWO<<K[OOQ$IS<<KZ<<KZO& ^Q`O<<K[O$0hQWO<<KZOOQQG26nG26nO#MdQWOG26nOOQO7+)}7+)}O5qQWO7+)}O& eQWO<<NoOOQQG27ZG27ZO5iQ$I[OG27ZOITQWOG26nOLXQYO1G4_O& mQWO7++QO5iQ$I[O1G2xO#5YQWO1G2xO5_QWO1G2xO!,rQpO1G2xO!?{Q&jO1G2xO%3RQ$ItO1G0ZO& uQ&jO1G2xO%/VQWOANAhOOQQANAhANAhOITQWOANAhO&!WQWOANAhO&!`Q`OANAhOOQQANAkANAkO5iQ$I[OANAkO#5YQWOANAkOOQO'#Gv'#GvOOQO7+)|7+)|OOQQG22vG22vOOQQANAsANAsO&!jQWOANAsOOQQAND[AND[OOQQAND]AND]OOQQ<<Ln<<LnOOQO<<Ia<<IaO%1gQ$IfO<<IaOOQO<<IZ<<IZO:^QWO<<IZO){QYO<<IaO!,rQpO<<IZO&!oQ$I[O<<IaO!?{Q&jO<<IZO&!zQ$I[O<<IaO&#YQ7^O7+'gOOQO<<M^<<M^OOQ$ISAN@vAN@vO$0hQWOAN@vOOQ$ISAN@uAN@uOOQQLD,YLD,YOOQO<<Mi<<MiOOQQLD,uLD,uO#MdQWOLD,YO&$xQ7^O7+)yOOQO7+(d7+(dO5iQ$I[O7+(dO#5YQWO7+(dO5_QWO7+(dO!,rQpO7+(dO!?{Q&jO7+(dOOQQG27SG27SO%/VQWOG27SOITQWOG27SOOQQG27VG27VO5iQ$I[OG27VOOQQG27_G27_OOQOAN>{AN>{OOQOAN>uAN>uO%1gQ$IfOAN>{O:^QWOAN>uO){QYOAN>{O!,rQpOAN>uO&%SQ$I[OAN>{O&%_Q7^O<<KfOOQ$ISG26bG26bOOQQ!$( t!$( tOOQO<<LO<<LOO5iQ$I[O<<LOO#5YQWO<<LOO5_QWO<<LOO!,rQpO<<LOOOQQLD,nLD,nO%/VQWOLD,nOOQQLD,qLD,qOOQOG24gG24gOOQOG24aG24aO%1gQ$IfOG24gO:^QWOG24aO){QYOG24gO&&}QMhO,5:rO&'tQ!LQO'#IqOOQOANAjANAjO5iQ$I[OANAjO#5YQWOANAjO5_QWOANAjOOQQ!$(!Y!$(!YOOQOLD*RLD*ROOQOLD){LD){O%1gQ$IfOLD*RO&(hQMhO,59jO&)[QMhO,5<UO&*OQMhO,5<WO&*rQMhO,5<fOOQOG27UG27UO5iQ$I[OG27UO#5YQWOG27UOOQO!$'Mm!$'MmO&+iQMhO1G2[O&,]QMhO1G2^O&-PQMhO1G1yOOQOLD,pLD,pO5iQ$I[OLD,pO&-vQMhO7+'gOOQO!$(![!$(![O&.mQMhO<<KfOLXQYO'#DrO&/dQbO'#ItOLXQYO'#DjO&/kQ$IfO'#ChO&0UQbO'#ChO&0fQYO,5:vO&2fQWO'#EWOLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO,5;ROLXQYO'#IPO&3pQWO,5<TO&5SQWO,5;ROLXQYO,5;fO!(^QWO'#DOO!(^QWO'#DOO!(^QWO'#DOOITQWO'#FjO&2fQWO'#FjO&3xQWO'#FjOITQWO'#FlO&2fQWO'#FlO&3xQWO'#FlOITQWO'#FzO&2fQWO'#FzO&3xQWO'#FzOLXQYO,5?mO&0fQYO1G0bO&5ZQ7^O'#ChOLXQYO1G1lOITQWO,5<pO&2fQWO,5<pO&3xQWO,5<pOITQWO,5<rO&2fQWO,5<rO&3xQWO,5<rOITQWO,5<_O&2fQWO,5<_O&3xQWO,5<_O&0fQYO1G1mOLXQYO7+&iOITQWO1G1{O&2fQWO1G1{O&3xQWO1G1{O&0fQYO7+'XO&0fQYO7+%|OITQWO7+'zO&2fQWO7+'zO&3xQWO7+'zO&5eQWO7+'pO&5eQWO<<K[O&5eQWOAN@vO&5jQWO'#E[O&5oQWO'#E[O&5wQWO'#EzO&5|QWO'#EgO&6RQWO'#JRO&6^QWO'#JPO&6iQWO,5:vO&6nQ#tO,5<QO&6uQWO'#FsO&6zQWO'#FsO&7PQWO'#FsO&7UQWO,5<RO&7^QWO,5:vO&7fQ7^O1G0}O&7mQWO,5<aO&7rQWO,5<aO&7wQWO,5<aO&7|QWO1G1mO&8RQWO1G0bO&8WQ#tO1G2`O&8_Q#tO1G2`O&8fQ#tO1G2`O&8mQWO1G2UO&8rQ`O7+'pO&8yQWO7+'pO&9OQ`O<<K[O4QQWO'#FhO5_QWO'#FgOBwQWO'#EZOLXQYO,5;cO!(mQWO'#FuO!(mQWO'#FuO!(mQWO'#FuOJdQWO,5<tOJdQWO,5<tOJdQWO,5<tO&9VQWO,5<jOITQWO1G2UO&9_QWO1G2UOITQWO7+'pO!&tQ&jO'#GOO!&tQ&jO,5<j",
  stateData: "&:]~O'YOS'ZOSTOSUOS~OPTOQTOXyO]cO_hObnOcmOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!TSO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!nlO#dsO#tpO#x^O%PqO%RtO%TrO%UrO%XuO%ZvO%^wO%_wO%axO%nzO%t{O%v|O%x}O%z!OO%}!PO&T!QO&Z!RO&]!SO&_!TO&a!UO&c!VO']PO'fQO'oYO'|aO~OP[XZ[X_[Xj[Xu[Xv[Xx[X!R[X!a[X!b[X!d[X!j[X!{[X#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'W[X'f[X'p[X'w[X'x[X~O!]$lX~P$zOR!WO'U!XO'V!ZO~OPTOQTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']![O'fQO'oYO'|aO~O!Q!`O!R!]O!O'jP!O'tP~P'dO!S!mO~P`OPTOQTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']9WO'fQO'oYO'|aO~OPTOQTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O'fQO'oYO'|aO~O!Q!rO#U!uO#V!rO']9XO!c'qP~P+{O#W!vO~O!]!wO#W!vO~OP#^OZ#dOj#ROu!{Ov!{Ox!|O!R#bO!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O_'hX'W'hX!c'hX!O'hX!T'hX%Q'hX!]'hX~P.jO!{#eO#o#eOP'iXZ'iX_'iXj'iXu'iXv'iXx'iX!R'iX!a'iX!b'iX!d'iX!j'iX#['iX#]'iX#^'iX#_'iX#`'iX#a'iX#b'iX#e'iX#g'iX#i'iX#j'iX'f'iX'p'iX'w'iX'x'iX~O#c'iX'W'iX!O'iX!c'iXn'iX!T'iX%Q'iX!]'iX~P0zO!{#eO~O#z#fO$R#jO~O!T#kO#x^O$U#lO$W#nO~O]#qOh$OOj#rOk#qOl#qOq$POs$QOx#xO!T#yO!_$VO!d#vO#V$WO#t$TO$_$RO$a$SO$d$UO']#pO'f#sO'a'cP~O!d$XO~O!]$ZO~O_$[O'W$[O~O']$`O~O!d$XO']$`O'^$bO'b$cO~Oc$iO!d$XO']$`O~O#c#TO~O]$rOu$nO!T$kO!d$mO%R$qO']$`O'^$bO^(UP~O!n$sO~Ox$tO!T$uO']$`O~Ox$tO!T$uO%Z$yO']$`O~O']$zO~O#dsO%RtO%TrO%UrO%XuO%ZvO%^wO%_wO~Ob%TOc%SO!n%QO%P%RO%c%PO~P7uOb%WOcmO!T%VO!nlO#dsO%PqO%TrO%UrO%XuO%ZvO%^wO%_wO%axO~O`%ZO!{%^O%R%XO'^$bO~P8tO!d%_O!g%cO~O!d%dO~O!TSO~O_$[O'T%lO'W$[O~O_$[O'T%oO'W$[O~O_$[O'T%qO'W$[O~OR!WO'U!XO'V%uO~OP[XZ[Xj[Xu[Xv[Xx[X!R[X!RdX!a[X!b[X!d[X!j[X!{[X!{dX#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'f[X'p[X'w[X'x[X~O!O[X!OdX~P;aO!Q%wO!O&iX!O&nX!R&iX!R&nX~P'dO!R%yO!O'jX~OP#^OZ#dOj#ROu!{Ov!{Ox!|O!R%yO!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O!O'jX~P>^O!O&OO~Ox&RO!W&]O!X&UO!Y&UO'^$bO~O]&SOk&SO!Q&VO'g&PO!S'kP!S'vP~P@aO!O'sX!R'sX!]'sX!c'sX'p'sX~O!{'sX#W#PX!S'sX~PAYO!{&^O!O'uX!R'uX~O!R&_O!O'tX~O!O&bO~O!{#eO~PAYOS&fO!T&cO!o&eO']$`O~Oc&kO!d$XO']$`O~Ou$nO!d$mO~O!S&lO~P`Ou!{Ov!{Ox!|O!b!yO!d!zO'fQOP!faZ!faj!fa!R!fa!a!fa!j!fa#[!fa#]!fa#^!fa#_!fa#`!fa#a!fa#b!fa#c!fa#e!fa#g!fa#i!fa#j!fa'p!fa'w!fa'x!fa~O_!fa'W!fa!O!fa!c!fan!fa!T!fa%Q!fa!]!fa~PCcO!c&mO~O!]!wO!{&oO'p&nO!R'rX_'rX'W'rX~O!c'rX~PE{O!R&sO!c'qX~O!c&uO~Ox$tO!T$uO#V&vO']$`O~OPTOQTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!TSO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']9WO'fQO'oYO'|aO~O]#qOh$OOj#rOk#qOl#qOq$POs9kOx#xO!T#yO!_;RO!d#vO#V9tO#t$TO$_9nO$a9qO$d$UO']&zO'f#sO~O#W&|O~O]#qOh$OOj#rOk#qOl#qOq$POs$QOx#xO!T#yO!_$VO!d#vO#V$WO#t$TO$_$RO$a$SO$d$UO']&zO'f#sO~O'a'mP~PJdO!Q'QO!c'nP~P){O'g'SO'oYO~OP9TOQ9TO]cOb;POc!jOhcOj9TOkcOlcOq9TOs9TOxRO{cO|cO}cO!T!bO!_9VO!dUO!g9TO!h9TO!i9TO!j9TO!k9TO!n!iO#t!lO#x^O']'bO'fQO'oYO'|:}O~O!d!zO~O!R#bO_$]a'W$]a!c$]a!O$]a!T$]a%Q$]a!]$]a~O#d'iO~PITO!]'kO!T'yX#w'yX#z'yX$R'yX~Ou'lO~P! POu'lO!T'yX#w'yX#z'yX$R'yX~O!T'nO#w'rO#z'mO$R'sO~O!Q'vO~PLXO#z#fO$R'yO~Ou$eXx$eX!b$eX'p$eX'w$eX'x$eX~OSfX!RfX!{fX'afX'a$eX~P!!iOk'{O~OR'|O'U'}O'V(PO~Ou(ROx(SO'p#[O'w(UO'x(WO~O'a(QO~P!#rO'a(ZO~O]#qOh$OOj#rOk#qOl#qOq$POs9kOx#xO!T#yO!_;RO!d#vO#V9tO#t$TO$_9nO$a9qO$d$UO'f#sO~O!Q(_O']([O!c'}P~P!$aO#W(aO~O!Q(eO'](bO!O(OP~P!$aOj(sOx(kO!W(qO!X(jO!Y(jO!d(hO!x(rO$w(mO'^$bO'g(gO~O!S(pO~P!&XO!b!yOu'eXx'eX'p'eX'w'eX'x'eX!R'eX!{'eX~O'a'eX#m'eX~P!'QOS(vO!{(uO!R'dX'a'dX~O!R(wO'a'cX~O'](yO~O!d)OO~O']&zO~O!d(hO~Ox$tO!Q!rO!T$uO#U!uO#V!rO']$`O!c'qP~O!]!wO#W)SO~OP#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O_!^a!R!^a'W!^a!O!^a!c!^an!^a!T!^a%Q!^a!]!^a~P!)cOS)[O!T&cO!o)ZO%Q)YO'b$cO~O']$zO'a'cP~O!])_O!T'`X_'`X!R'`X'W'`X~O!d$XO'b$cO~O!d$XO']$`O'b$cO~O!]!wO#W&|O~O])jO%R)kO'])gO!S(VP~O!R)lO^(UX~O'g'SO~OZ)pO~O^)qO~O!T$kO']$`O'^$bO^(UP~Ox$tO!Q)vO!R&_O!T$uO']$`O!O'tP~O]&YOk&YO!Q)wO'g'SO!S'vP~O!R)xO_(RX'W(RX~O!{)|O'b$cO~OS*PO!T#yO'b$cO~O!T*RO~Ou*TO!TSO~O!n*YO~Oc*_O~O'](yO!S(TP~Oc$iO~O%RtO']$zO~P8tOZ*eO^*dO~OPTOQTO]cObnOcmOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!nlO#x^O%PqO'fQO'oYO'|aO~O!T!bO#t!lO']9WO~P!1RO^*dO_$[O'W$[O~O_*iO#d*kO%T*kO%U*kO~P){O!d%_O~O%t*pO~O!T*rO~O&V*tO&X*uOP&SaQ&SaX&Sa]&Sa_&Sab&Sac&Sah&Saj&Sak&Sal&Saq&Sas&Sax&Sa{&Sa|&Sa}&Sa!T&Sa!_&Sa!d&Sa!g&Sa!h&Sa!i&Sa!j&Sa!k&Sa!n&Sa#d&Sa#t&Sa#x&Sa%P&Sa%R&Sa%T&Sa%U&Sa%X&Sa%Z&Sa%^&Sa%_&Sa%a&Sa%n&Sa%t&Sa%v&Sa%x&Sa%z&Sa%}&Sa&T&Sa&Z&Sa&]&Sa&_&Sa&a&Sa&c&Sa'S&Sa']&Sa'f&Sa'o&Sa'|&Sa!S&Sa%{&Sa`&Sa&Q&Sa~O']*zO~On*}O~O!O&ia!R&ia~P!)cO!Q+RO!O&iX!R&iX~P){O!R%yO!O'ja~O!O'ja~P>^O!R&_O!O'ta~O!RwX!R!ZX!SwX!S!ZX!]wX!]!ZX!d!ZX!{wX'b!ZX~O!]+WO!{+VO!R#TX!R'lX!S#TX!S'lX!]'lX!d'lX'b'lX~O!]+YO!d$XO'b$cO!R!VX!S!VX~O]&QOk&QOx&RO'g(gO~OP9TOQ9TO]cOb;POc!jOhcOj9TOkcOlcOq9TOs9TOxRO{cO|cO}cO!T!bO!_9VO!dUO!g9TO!h9TO!i9TO!j9TO!k9TO!n!iO#t!lO#x^O'fQO'oYO'|:}O~O']9yO~P!;^O!R+^O!S'kX~O!S+`O~O!]+WO!{+VO!R#TX!S#TX~O!R+aO!S'vX~O!S+cO~O]&QOk&QOx&RO'^$bO'g(gO~O!X+dO!Y+dO~P!>[Ox$tO!Q+fO!T$uO']$`O!O&nX!R&nX~O_+jO!W+mO!X+iO!Y+iO!r+qO!s+oO!t+pO!u+nO!x+rO'^$bO'g(gO'o+gO~O!S+lO~P!?]OS+wO!T&cO!o+vO~O!{+}O!R'ra!c'ra_'ra'W'ra~O!]!wO~P!@gO!R&sO!c'qa~Ox$tO!Q,QO!T$uO#U,SO#V,QO']$`O!R&pX!c&pX~O_#Oi!R#Oi'W#Oi!O#Oi!c#Oin#Oi!T#Oi%Q#Oi!]#Oi~P!)cO#W!za!R!za!c!za!{!za!T!za_!za'W!za!O!za~P!#rO#W'eXP'eXZ'eX_'eXj'eXv'eX!a'eX!d'eX!j'eX#['eX#]'eX#^'eX#_'eX#`'eX#a'eX#b'eX#c'eX#e'eX#g'eX#i'eX#j'eX'W'eX'f'eX!c'eX!O'eX!T'eXn'eX%Q'eX!]'eX~P!'QO!R,]O'a'mX~P!#rO'a,_O~O!R,`O!c'nX~P!)cO!c,cO~O!O,dO~OP#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O'fQOZ#Zi_#Zij#Zi!R#Zi!a#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O#[#Zi~P!EtO#[#PO~P!EtOP#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO'fQOZ#Zi_#Zi!R#Zi!a#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~Oj#Zi~P!H`Oj#RO~P!H`OP#^Oj#ROu!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO'fQO_#Zi!R#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~OZ#Zi!a#Zi#a#Zi#b#Zi#c#Zi~P!JzOZ#dO!a#TO#a#TO#b#TO#c#TO~P!JzOP#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO'fQO_#Zi!R#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O'w#Zi~P!MrO'w!}O~P!MrOP#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO'fQO'w!}O_#Zi!R#Zi#i#Zi#j#Zi'W#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O'x#Zi~P#!^O'x#OO~P#!^OP#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO'fQO'w!}O'x#OO~O_#Zi!R#Zi#j#Zi'W#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~P#$xOP[XZ[Xj[Xu[Xv[Xx[X!a[X!b[X!d[X!j[X!{[X#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'f[X'p[X'w[X'x[X!R[X!S[X~O#m[X~P#']OP#^OZ9iOj9^Ou!{Ov!{Ox!|O!a9`O!b!yO!d!zO!j#^O#[9[O#]9]O#^9]O#_9]O#`9_O#a9`O#b9`O#c9`O#e9aO#g9cO#i9eO#j9fO'fQO'p#[O'w!}O'x#OO~O#m,fO~P#)gOP'iXZ'iXj'iXu'iXv'iXx'iX!a'iX!b'iX!d'iX!j'iX#['iX#]'iX#^'iX#_'iX#`'iX#a'iX#b'iX#e'iX#g'iX#i'iX#j'iX'f'iX'p'iX'w'iX'x'iX!R'iX~O!{9jO#o9jO#c'iX#m'iX!S'iX~P#+bO_&sa!R&sa'W&sa!c&san&sa!O&sa!T&sa%Q&sa!]&sa~P!)cOP#ZiZ#Zi_#Zij#Ziv#Zi!R#Zi!a#Zi!b#Zi!d#Zi!j#Zi#[#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'f#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~P!#rO_#ni!R#ni'W#ni!O#ni!c#nin#ni!T#ni%Q#ni!]#ni~P!)cO#z,hO~O#z,iO~O!]'kO!{,jO!T$OX#w$OX#z$OX$R$OX~O!Q,kO~O!T'nO#w,mO#z'mO$R,nO~O!R9gO!S'hX~P#)gO!S,oO~O$R,qO~OR'|O'U'}O'V,tO~O],wOk,wO!O,xO~O!RdX!]dX!cdX!c$eX'pdX~P!!iO!c-OO~P!#rO!R-PO!]!wO'p&nO!c'}X~O!c-UO~O!O$eX!R$eX!]$lX~P!!iO!R-WO!O(OX~P!#rO!]-YO~O!O-[O~O!Q(_O']$`O!c'}P~Oj-`O!]!wO!d$XO'b$cO'p&nO~O!])_O~O_$[O!R-eO'W$[O~O!S-gO~P!&XO!X-hO!Y-hO'^$bO'g(gO~Ox-jO'g(gO~O!x-kO~O']$zO!R&xX'a&xX~O!R(wO'a'ca~Ou-pOv-pOx-qO'pra'wra'xra!Rra!{ra~O'ara#mra~P#6qOu(ROx(SO'p$^a'w$^a'x$^a!R$^a!{$^a~O'a$^a#m$^a~P#7gOu(ROx(SO'p$`a'w$`a'x$`a!R$`a!{$`a~O'a$`a#m$`a~P#8YO]-rO~O#W-sO~O'a$na!R$na#m$na!{$na~P!#rO#W-vO~OS.PO!T&cO!o.OO%Q-}O~O'a.QO~O]#qOj#rOk#qOl#qOq$POs9kOx#xO!T#yO!_;RO!d#vO#V9tO#t$TO$_9nO$a9qO$d$UO'f#sO~Oh.SO'].RO~P#:PO!])_O!T'`a_'`a!R'`a'W'`a~O#W.YO~OZ[X!RdX!SdX~O!R.ZO!S(VX~O!S.]O~OZ.^O~O].`O'])gO~O!T$kO']$`O^'QX!R'QX~O!R)lO^(Ua~O!c.cO~P!)cO].eO~OZ.fO~O^.gO~OS.PO!T&cO!o.OO%Q-}O'b$cO~O!R)xO_(Ra'W(Ra~O!{.mO~OS.pO!T#yO~O'g'SO!S(SP~OS.zO!T.vO!o.yO%Q.xO'b$cO~OZ/UO!R/SO!S(TX~O!S/VO~O^/XO_$[O'W$[O~O]/YO~O]/ZO'](yO~O#c/[O%r/]O~P0zO!{#eO#c/[O%r/]O~O_/^O~P){O_/`O~O%{/dOP%yiQ%yiX%yi]%yi_%yib%yic%yih%yij%yik%yil%yiq%yis%yix%yi{%yi|%yi}%yi!T%yi!_%yi!d%yi!g%yi!h%yi!i%yi!j%yi!k%yi!n%yi#d%yi#t%yi#x%yi%P%yi%R%yi%T%yi%U%yi%X%yi%Z%yi%^%yi%_%yi%a%yi%n%yi%t%yi%v%yi%x%yi%z%yi%}%yi&T%yi&Z%yi&]%yi&_%yi&a%yi&c%yi'S%yi']%yi'f%yi'o%yi'|%yi!S%yi`%yi&Q%yi~O`/jO!S/hO&Q/iO~P`O!TSO!d/lO~O&X*uOP&SiQ&SiX&Si]&Si_&Sib&Sic&Sih&Sij&Sik&Sil&Siq&Sis&Six&Si{&Si|&Si}&Si!T&Si!_&Si!d&Si!g&Si!h&Si!i&Si!j&Si!k&Si!n&Si#d&Si#t&Si#x&Si%P&Si%R&Si%T&Si%U&Si%X&Si%Z&Si%^&Si%_&Si%a&Si%n&Si%t&Si%v&Si%x&Si%z&Si%}&Si&T&Si&Z&Si&]&Si&_&Si&a&Si&c&Si'S&Si']&Si'f&Si'o&Si'|&Si!S&Si%{&Si`&Si&Q&Si~O!R#bOn$]a~O!O&ii!R&ii~P!)cO!R%yO!O'ji~O!R&_O!O'ti~O!O/rO~O!R!Va!S!Va~P#)gO]&QOk&QO!Q/xO'g(gO!R&jX!S&jX~P@aO!R+^O!S'ka~O]&YOk&YO!Q)wO'g'SO!R&oX!S&oX~O!R+aO!S'va~O!O'ui!R'ui~P!)cO_$[O!]!wO!d$XO!j0SO!{0QO'W$[O'b$cO'p&nO~O!S0VO~P!?]O!X0WO!Y0WO'^$bO'g(gO'o+gO~O!W0XO~P#LVO!TSO!W0XO!u0ZO!x0[O~P#LVO!W0XO!s0^O!t0^O!u0ZO!x0[O~P#LVO!T&cO~O!T&cO~P!#rO!R'ri!c'ri_'ri'W'ri~P!)cO!{0gO!R'ri!c'ri_'ri'W'ri~O!R&sO!c'qi~Ox$tO!T$uO#V0iO']$`O~O#WraPraZra_rajra!ara!bra!dra!jra#[ra#]ra#^ra#_ra#`ra#ara#bra#cra#era#gra#ira#jra'Wra'fra!cra!Ora!Tranra%Qra!]ra~P#6qO#W$^aP$^aZ$^a_$^aj$^av$^a!a$^a!b$^a!d$^a!j$^a#[$^a#]$^a#^$^a#_$^a#`$^a#a$^a#b$^a#c$^a#e$^a#g$^a#i$^a#j$^a'W$^a'f$^a!c$^a!O$^a!T$^an$^a%Q$^a!]$^a~P#7gO#W$`aP$`aZ$`a_$`aj$`av$`a!a$`a!b$`a!d$`a!j$`a#[$`a#]$`a#^$`a#_$`a#`$`a#a$`a#b$`a#c$`a#e$`a#g$`a#i$`a#j$`a'W$`a'f$`a!c$`a!O$`a!T$`an$`a%Q$`a!]$`a~P#8YO#W$naP$naZ$na_$naj$nav$na!R$na!a$na!b$na!d$na!j$na#[$na#]$na#^$na#_$na#`$na#a$na#b$na#c$na#e$na#g$na#i$na#j$na'W$na'f$na!c$na!O$na!T$na!{$nan$na%Q$na!]$na~P!#rO_#Oq!R#Oq'W#Oq!O#Oq!c#Oqn#Oq!T#Oq%Q#Oq!]#Oq~P!)cO!R&kX'a&kX~PJdO!R,]O'a'ma~O!Q0qO!R&lX!c&lX~P){O!R,`O!c'na~O!R,`O!c'na~P!)cO#m!fa!S!fa~PCcO#m!^a!R!^a!S!^a~P#)gO!T1UO#x^O$P1VO~O!S1ZO~On1[O~P!#rO_$Yq!R$Yq'W$Yq!O$Yq!c$Yqn$Yq!T$Yq%Q$Yq!]$Yq~P!)cO!O1]O~O],wOk,wO~Ou(ROx(SO'x(WO'p$xi'w$xi!R$xi!{$xi~O'a$xi#m$xi~P$,vOu(ROx(SO'p$zi'w$zi'x$zi!R$zi!{$zi~O'a$zi#m$zi~P$-iO#m1^O~P!#rO!Q1`O']$`O!R&tX!c&tX~O!R-PO!c'}a~O!R-PO!]!wO!c'}a~O!R-PO!]!wO'p&nO!c'}a~O'a$gi!R$gi#m$gi!{$gi~P!#rO!Q1gO'](bO!O&vX!R&vX~P!$aO!R-WO!O(Oa~O!R-WO!O(Oa~P!#rO!]!wO~O!]!wO#c1oO~Oj1rO!]!wO'p&nO~O!R'di'a'di~P!#rO!{1uO!R'di'a'di~P!#rO!c1xO~O_$Zq!R$Zq'W$Zq!O$Zq!c$Zqn$Zq!T$Zq%Q$Zq!]$Zq~P!)cO!R1|O!T(PX~P!#rO!T&cO%Q2PO~O!T&cO%Q2PO~P!#rO!T$eX$u[X_$eX!R$eX'W$eX~P!!iO$u2TOugXxgX!TgX'pgX'wgX'xgX_gX!RgX'WgX~O$u2TO~O]2ZO%R2[O'])gO!R'PX!S'PX~O!R.ZO!S(Va~OZ2`O~O^2aO~O]2dO~OS2fO!T&cO!o2eO%Q2PO~O_$[O'W$[O~P!#rO!T#yO~P!#rO!R2kO!{2mO!S(SX~O!S2nO~Ox;]O!W2wO!X2pO!Y2pO!r2vO!s2uO!t2uO!x2tO'^$bO'g(gO'o+gO~O!S2sO~P$6QOS3OO!T.vO!o2}O%Q2|O~OS3OO!T.vO!o2}O%Q2|O'b$cO~O'](yO!R'OX!S'OX~O!R/SO!S(Ta~O]3YO'g3XO~O]3ZO~O^3]O~O!c3`O~P){O_3bO~O_3bO~P){O#c3dO%r3eO~PE{O`/jO!S3iO&Q/iO~P`O!]3kO~O!R#Ti!S#Ti~P#)gO!{3mO!R#Ti!S#Ti~O!R!Vi!S!Vi~P#)gO_$[O!{3tO'W$[O~O_$[O!]!wO!{3tO'W$[O~O!X3xO!Y3xO'^$bO'g(gO'o+gO~O_$[O!]!wO!d$XO!j3yO!{3tO'W$[O'b$cO'p&nO~O!W3zO~P$:oO!W3zO!u3}O!x4OO~P$:oO_$[O!]!wO!j3yO!{3tO'W$[O'p&nO~O!R'rq!c'rq_'rq'W'rq~P!)cO!R&sO!c'qq~O#W$xiP$xiZ$xi_$xij$xiv$xi!a$xi!b$xi!d$xi!j$xi#[$xi#]$xi#^$xi#_$xi#`$xi#a$xi#b$xi#c$xi#e$xi#g$xi#i$xi#j$xi'W$xi'f$xi!c$xi!O$xi!T$xin$xi%Q$xi!]$xi~P$,vO#W$ziP$ziZ$zi_$zij$ziv$zi!a$zi!b$zi!d$zi!j$zi#[$zi#]$zi#^$zi#_$zi#`$zi#a$zi#b$zi#c$zi#e$zi#g$zi#i$zi#j$zi'W$zi'f$zi!c$zi!O$zi!T$zin$zi%Q$zi!]$zi~P$-iO#W$giP$giZ$gi_$gij$giv$gi!R$gi!a$gi!b$gi!d$gi!j$gi#[$gi#]$gi#^$gi#_$gi#`$gi#a$gi#b$gi#c$gi#e$gi#g$gi#i$gi#j$gi'W$gi'f$gi!c$gi!O$gi!T$gi!{$gin$gi%Q$gi!]$gi~P!#rO!R&ka'a&ka~P!#rO!R&la!c&la~P!)cO!R,`O!c'ni~O#m#Oi!R#Oi!S#Oi~P#)gOP#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O'fQOZ#Zij#Zi!a#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~O#[#Zi~P$DVO#[9[O~P$DVOP#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[9[O#]9]O#^9]O#_9]O'fQOZ#Zi!a#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~Oj#Zi~P$F_Oj9^O~P$F_OP#^Oj9^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[9[O#]9]O#^9]O#_9]O#`9_O'fQO#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~OZ#Zi!a#Zi#a#Zi#b#Zi#c#Zi~P$HgOZ9iO!a9`O#a9`O#b9`O#c9`O~P$HgOP#^OZ9iOj9^Ou!{Ov!{Ox!|O!a9`O!b!yO!d!zO!j#^O#[9[O#]9]O#^9]O#_9]O#`9_O#a9`O#b9`O#c9`O#e9aO'fQO#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'x#Zi!R#Zi!S#Zi~O'w#Zi~P$J{O'w!}O~P$J{OP#^OZ9iOj9^Ou!{Ov!{Ox!|O!a9`O!b!yO!d!zO!j#^O#[9[O#]9]O#^9]O#_9]O#`9_O#a9`O#b9`O#c9`O#e9aO#g9cO'fQO'w!}O#i#Zi#j#Zi#m#Zi'p#Zi!R#Zi!S#Zi~O'x#Zi~P$MTO'x#OO~P$MTOP#^OZ9iOj9^Ou!{Ov!{Ox!|O!a9`O!b!yO!d!zO!j#^O#[9[O#]9]O#^9]O#_9]O#`9_O#a9`O#b9`O#c9`O#e9aO#g9cO#i9eO'fQO'w!}O'x#OO~O#j#Zi#m#Zi'p#Zi!R#Zi!S#Zi~P% ]O_#ky!R#ky'W#ky!O#ky!c#kyn#ky!T#ky%Q#ky!]#ky~P!)cOP#ZiZ#Zij#Ziv#Zi!a#Zi!b#Zi!d#Zi!j#Zi#[#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'f#Zi!R#Zi!S#Zi~P!#rO!b!yOu'eXx'eX'p'eX'w'eX'x'eX!S'eX~OP'eXZ'eXj'eXv'eX!a'eX!d'eX!j'eX#['eX#]'eX#^'eX#_'eX#`'eX#a'eX#b'eX#c'eX#e'eX#g'eX#i'eX#j'eX#m'eX'f'eX!R'eX~P%%mO#m#ni!R#ni!S#ni~P#)gO!S4`O~O!R&sa!S&sa~P#)gO!]!wO'p&nO!R&ta!c&ta~O!R-PO!c'}i~O!R-PO!]!wO!c'}i~O!O&va!R&va~P!#rO!]4gO~O!R-WO!O(Oi~P!#rO!R-WO!O(Oi~O!O4kO~O!]!wO#c4pO~Oj4qO!]!wO'p&nO~O!O4sO~O'a$iq!R$iq#m$iq!{$iq~P!#rO_$Zy!R$Zy'W$Zy!O$Zy!c$Zyn$Zy!T$Zy%Q$Zy!]$Zy~P!)cO!R1|O!T(Pa~O!T&cO%Q4xO~O!T&cO%Q4xO~P!#rO_#Oy!R#Oy'W#Oy!O#Oy!c#Oyn#Oy!T#Oy%Q#Oy!]#Oy~P!)cOZ4{O~O]4}O'])gO~O!R.ZO!S(Vi~O]5QO~O^5RO~O'g'SO!R&{X!S&{X~O!R2kO!S(Sa~O!S5`O~P$6QOx;^O'g(gO'o+gO~O!W5cO!X5bO!Y5bO!x0[O'^$bO'g(gO'o+gO~O!s5dO!t5dO~P%.RO!X5bO!Y5bO'^$bO'g(gO'o+gO~O!T.vO~O!T.vO%Q5fO~O!T.vO%Q5fO~P!#rOS5kO!T.vO!o5jO%Q5fO~OZ5pO!R'Oa!S'Oa~O!R/SO!S(Ti~O]5sO~O!c5tO~O!c5uO~O!c5vO~O!c5vO~P){O_5xO~O!]5{O~O!c5|O~O!R'ui!S'ui~P#)gO_$[O'W$[O~P!)cO_$[O!{6RO'W$[O~O_$[O!]!wO!{6RO'W$[O~O!X6WO!Y6WO'^$bO'g(gO'o+gO~O_$[O!]!wO!j6XO!{6RO'W$[O'p&nO~O!d$XO'b$cO~P%2mO!W6YO~P%2[O!R'ry!c'ry_'ry'W'ry~P!)cO#W$iqP$iqZ$iq_$iqj$iqv$iq!R$iq!a$iq!b$iq!d$iq!j$iq#[$iq#]$iq#^$iq#_$iq#`$iq#a$iq#b$iq#c$iq#e$iq#g$iq#i$iq#j$iq'W$iq'f$iq!c$iq!O$iq!T$iq!{$iqn$iq%Q$iq!]$iq~P!#rO!R&li!c&li~P!)cO#m#Oq!R#Oq!S#Oq~P#)gOu-pOv-pOx-qO'pra'wra'xra!Sra~OPraZrajra!ara!bra!dra!jra#[ra#]ra#^ra#_ra#`ra#ara#bra#cra#era#gra#ira#jra#mra'fra!Rra~P%6eOu(ROx(SO'p$^a'w$^a'x$^a!S$^a~OP$^aZ$^aj$^av$^a!a$^a!b$^a!d$^a!j$^a#[$^a#]$^a#^$^a#_$^a#`$^a#a$^a#b$^a#c$^a#e$^a#g$^a#i$^a#j$^a#m$^a'f$^a!R$^a~P%8fOu(ROx(SO'p$`a'w$`a'x$`a!S$`a~OP$`aZ$`aj$`av$`a!a$`a!b$`a!d$`a!j$`a#[$`a#]$`a#^$`a#_$`a#`$`a#a$`a#b$`a#c$`a#e$`a#g$`a#i$`a#j$`a#m$`a'f$`a!R$`a~P%:gOP$naZ$naj$nav$na!a$na!b$na!d$na!j$na#[$na#]$na#^$na#_$na#`$na#a$na#b$na#c$na#e$na#g$na#i$na#j$na#m$na'f$na!R$na!S$na~P!#rO#m$Yq!R$Yq!S$Yq~P#)gO#m$Zq!R$Zq!S$Zq~P#)gO!S6dO~O'a$|y!R$|y#m$|y!{$|y~P!#rO!]!wO!R&ti!c&ti~O!]!wO'p&nO!R&ti!c&ti~O!R-PO!c'}q~O!O&vi!R&vi~P!#rO!R-WO!O(Oq~O!O6jO~P!#rO!O6jO~O!R'dy'a'dy~P!#rO!R&ya!T&ya~P!#rO!T$tq_$tq!R$tq'W$tq~P!#rOZ6qO~O!R.ZO!S(Vq~O]6tO~O!T&cO%Q6uO~O!T&cO%Q6uO~P!#rO!{6vO!R&{a!S&{a~O!R2kO!S(Si~P#)gO!X6|O!Y6|O'^$bO'g(gO'o+gO~O!W7OO!x4OO~P%BkO!T.vO%Q7RO~O!T.vO%Q7RO~P!#rO]7YO'g7XO~O!R/SO!S(Tq~O!c7[O~O!c7[O~P){O!c7^O~O!c7_O~O!R#Ty!S#Ty~P#)gO_$[O!{7eO'W$[O~O_$[O!]!wO!{7eO'W$[O~O!X7hO!Y7hO'^$bO'g(gO'o+gO~O_$[O!]!wO!j7iO!{7eO'W$[O'p&nO~O#W$|yP$|yZ$|y_$|yj$|yv$|y!R$|y!a$|y!b$|y!d$|y!j$|y#[$|y#]$|y#^$|y#_$|y#`$|y#a$|y#b$|y#c$|y#e$|y#g$|y#i$|y#j$|y'W$|y'f$|y!c$|y!O$|y!T$|y!{$|yn$|y%Q$|y!]$|y~P!#rO#m#ky!R#ky!S#ky~P#)gOP$giZ$gij$giv$gi!a$gi!b$gi!d$gi!j$gi#[$gi#]$gi#^$gi#_$gi#`$gi#a$gi#b$gi#c$gi#e$gi#g$gi#i$gi#j$gi#m$gi'f$gi!R$gi!S$gi~P!#rOu(ROx(SO'x(WO'p$xi'w$xi!S$xi~OP$xiZ$xij$xiv$xi!a$xi!b$xi!d$xi!j$xi#[$xi#]$xi#^$xi#_$xi#`$xi#a$xi#b$xi#c$xi#e$xi#g$xi#i$xi#j$xi#m$xi'f$xi!R$xi~P%JROu(ROx(SO'p$zi'w$zi'x$zi!S$zi~OP$ziZ$zij$ziv$zi!a$zi!b$zi!d$zi!j$zi#[$zi#]$zi#^$zi#_$zi#`$zi#a$zi#b$zi#c$zi#e$zi#g$zi#i$zi#j$zi#m$zi'f$zi!R$zi~P%LSO#m$Zy!R$Zy!S$Zy~P#)gO#m#Oy!R#Oy!S#Oy~P#)gO!]!wO!R&tq!c&tq~O!R-PO!c'}y~O!O&vq!R&vq~P!#rO!O7mO~P!#rO!R.ZO!S(Vy~O!R2kO!S(Sq~O!X7yO!Y7yO'^$bO'g(gO'o+gO~O!T.vO%Q7|O~O!T.vO%Q7|O~P!#rO!c8PO~O_$[O!{8UO'W$[O~O_$[O!]!wO!{8UO'W$[O~OP$iqZ$iqj$iqv$iq!a$iq!b$iq!d$iq!j$iq#[$iq#]$iq#^$iq#_$iq#`$iq#a$iq#b$iq#c$iq#e$iq#g$iq#i$iq#j$iq#m$iq'f$iq!R$iq!S$iq~P!#rO!R&{q!S&{q~P#)gO_$[O!{8hO'W$[O~OP$|yZ$|yj$|yv$|y!a$|y!b$|y!d$|y!j$|y#[$|y#]$|y#^$|y#_$|y#`$|y#a$|y#b$|y#c$|y#e$|y#g$|y#i$|y#j$|y#m$|y'f$|y!R$|y!S$|y~P!#rO!S!za!W!za!X!za!Y!za!r!za!s!za!t!za!x!za'^!za'g!za'o!za~P!#rO!W'eX!X'eX!Y'eX!r'eX!s'eX!t'eX!x'eX'^'eX'g'eX'o'eX~P%%mO!Wra!Xra!Yra!rra!sra!tra!xra'^ra'gra'ora~P%6eO!W$^a!X$^a!Y$^a!r$^a!s$^a!t$^a!x$^a'^$^a'g$^a'o$^a~P%8fO!W$`a!X$`a!Y$`a!r$`a!s$`a!t$`a!x$`a'^$`a'g$`a'o$`a~P%:gO!S$na!W$na!X$na!Y$na!r$na!s$na!t$na!x$na'^$na'g$na'o$na~P!#rO!W$xi!X$xi!Y$xi!r$xi!s$xi!t$xi!x$xi'^$xi'g$xi'o$xi~P%JRO!W$zi!X$zi!Y$zi!r$zi!s$zi!t$zi!x$zi'^$zi'g$zi'o$zi~P%LSO!S$gi!W$gi!X$gi!Y$gi!r$gi!s$gi!t$gi!x$gi'^$gi'g$gi'o$gi~P!#rO!S$iq!W$iq!X$iq!Y$iq!r$iq!s$iq!t$iq!x$iq'^$iq'g$iq'o$iq~P!#rO!S$|y!W$|y!X$|y!Y$|y!r$|y!s$|y!t$|y!x$|y'^$|y'g$|y'o$|y~P!#rOn'hX~P.jOn[X!O[X!c[X%r[X!T[X%Q[X!][X~P$zO!]dX!c[X!cdX'pdX~P;aOP9TOQ9TO]cOb;POc!jOhcOj9TOkcOlcOq9TOs9TOxRO{cO|cO}cO!TSO!_9VO!dUO!g9TO!h9TO!i9TO!j9TO!k9TO!n!iO#t!lO#x^O']'bO'fQO'oYO'|:}O~O]#qOh$OOj#rOk#qOl#qOq$POs9lOx#xO!T#yO!_;SO!d#vO#V9uO#t$TO$_9oO$a9rO$d$UO']&zO'f#sO~O!R9gO!S$]a~O]#qOh$OOj#rOk#qOl#qOq$POs9mOx#xO!T#yO!_;TO!d#vO#V9vO#t$TO$_9pO$a9sO$d$UO']&zO'f#sO~O#d'iO~P&3xO!S[X!SdX~P;aO!]9ZO~O#W9YO~O!]!wO#W9YO~O!{9jO~O#c9`O~O!{9wO!R'uX!S'uX~O!{9jO!R'sX!S'sX~O#W9xO~O'a9zO~P!#rO#W:RO~O#W:SO~O#W:TO~O!]!wO#W:UO~O!]!wO#W9xO~O#m:VO~P#)gO#W:WO~O#W:XO~O#W:YO~O#W:ZO~O#W:[O~O#m:]O~P!#rO#m:^O~P!#rO#m:_O~P!#rO!O:`O~O!O:aO~P!#rO!O:aO~O!O:bO~P!#rO!]!wO#c;YO~O!]!wO#c;[O~O#x~!b!r!t!u#U#V'|$_$a$d$u%P%Q%R%X%Z%^%_%a%c~UT#x'|#]}'Y'Z#z'Y']'g~",
  goto: "#Hc(ZPPPPPPPP([P(lP*`PPPP-zPP.a3s5g5zP5zPPP5zP7t5zP5zP7xPP8OP8d<uPPPP<yPPPP<y?kPPP?qBSP<yPDgPPPPF`<yPPPPPHX<yPPKYLVPPPPLZMsPM{N|PLV<y<y!$^!'X!+z!+z!/ZPPP!/b!2W<yPPPPPPPPPP!4}P!6`PP<y!7mP<yP<y<y<y<yP<y!:[PP!=TP!?x!@Q!@U!@UP!=QP!@Y!@YP!B}P!CR<y<y!CX!E{5zP5zP5z5zP!GO5z5z!IU5z!Ki5z!Mi5z5z!NV#!]#!]#!a#!]#!iP#!]P5z##e5z#$y5z5z-zPPP#&cPP#&{#&{P#&{P#'b#&{PP#'hP#'_P#'_#'zMw#'_#(i#(o#(r([#(u([P#(|#(|#(|P([P([P([P([PP([P#)S#)VP#)V([P#)ZP#)^P([P([P([P([P([P([([#)d#)n#)t#)z#*Y#*`#*f#*p#*v#+V#+]#+k#+q#+w#,V#,l#.[#.j#.p#.v#.|#/S#/^#/d#/j#/t#0W#0^PPPPPPPP#0dPP#1W#4`PP#5v#5}#6VPP#;X#=l#Ch#Ck#Cn#Cy#C|PP#DP#DT#Dr#Ei#Em#FRPP#FV#F]#FaP#Fd#Fh#Fk#GZ#Gq#Gv#Gy#G|#HS#HV#HZ#H_mhOSj}!n$Z%b%e%f%h*m*r/d/gQ$hmQ$opQ%YyS&U!b+^Q&j!jS(j#y(oQ)e$iQ)r$qQ*^%SQ+d&]S+i&c+kQ+{&kQ-h(qQ/R*_Y0W+m+n+o+p+qS2p.v2rU3x0X0Z0^U5b2u2v2wS6W3z3}S6|5c5dQ7h6YR7y7O$p[ORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$Z$m%Z%^%b%d%e%f%h%l%w%y&R&^&e&o&|'Q(Q)S)Z*i*m*r+R+v+},`,f-q-v.O.Y.y/[/]/^/`/d/g/i0Q0g0q2e2}3b3d3e3t5j5x6R7e8U8h!j'd#]#k&V'v+V+Y,k/x1U2m3m6v9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QQ(z$QQ)j$kQ*`%VQ*g%_Q,V9kQ.T)_Q.`)kQ/Z*eQ2Z.ZQ3V/SQ4X9mQ4}2[R8s9lpeOSjy}!n$Z%X%b%e%f%h*m*r/d/gR*b%Z&WVOSTjkn}!S!W!k!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$Z$m%Z%^%_%b%d%e%f%h%l%y&R&^&e&o&|'Q'v(Q)S)Z*i*m*r+R+V+Y+v+},`,f,k-q-v.O.Y.y/[/]/^/`/d/g/i/x0Q0g0q1U2e2m2}3b3d3e3m3t5j5x6R6v7e8U8h9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;P;Q[!cRU!]!`%w&VQ$alQ$gmS$lp$qv$vrs!r!u$X$t&_&s&v)v)w)x*k+W+f,Q,S/l0iQ%OwQ&g!iQ&i!jS(^#v(hS)d$h$iQ)h$kQ)u$sQ*X%QQ*]%SS+z&j&kQ-T(_Q.X)eQ._)kQ.a)lQ.d)pQ.|*YS/Q*^*_Q0e+{Q1_-PQ2Y.ZQ2^.^Q2c.fQ3U/RQ4d1`Q4|2[Q5P2`Q6p4{R7p6q!Y$em!j$g$h$i&T&i&j&k(i)d)e+Z+h+z+{-a.X/}0T0Y0e1q3w3|6U7f8VQ)]$aQ)}${Q*Q$|Q*[%SQ.h)uQ.{*XU/P*]*^*_Q3P.|S3T/Q/RQ5]2oQ5o3US6z5^5aS7w6{6}Q8_7xR8n8`W#|a$c(w:}S${t%XQ$|uQ$}vR){$y$o#{a!w!y#d#v#x$R$S$W&f'|(V(X(Y(a(e(u(v)Y)[)_)|*P+w,]-W-Y-s-}.P.m.p.x.z1^1g1o1u1|2P2T2f2|3O4g4p4x5f5k6u7R7|9Z9i9n9o9p9q9r9s9t9u9v9{9|9}:O:P:Q:R:S:T:W:X:Y:]:^:_:};U;V;W;Y;[T'}#s(OX({$Q9k9l9mU&Y!b$u+aQ'T!{Q)o$nQ.q*RQ1v-pR5X2k&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&V&^&e&o&|'Q'v(Q)S)Z*i*m*r+R+V+Y+v+},`,f,k-q-v.O.Y.y/[/]/^/`/d/g/i/x0Q0g0q1U2e2m2}3b3d3e3m3t5j5x6R6v7e8U8h9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;Q$]#aZ!_!o$_%v%|&x'P'V'W'X'Y'Z'[']'^'_'`'a'c'f'j't)n+P+[+e+|,[,b,e,g,u-t/s/v0f0p0t0u0v0w0x0y0z0{0|0}1O1P1Q1T1Y1z2W3o3r4S4V4W4]4^5Z5}6Q6^6b6c7b7s8S8f8r9U:pT!XQ!Y&_cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&V&^&e&o&|'Q'v(Q)S)Z*i*m*r+R+V+Y+v+},`,f,k-q-v.O.Y.y/[/]/^/`/d/g/i/x0Q0g0q1U2e2m2}3b3d3e3m3t5j5x6R6v7e8U8h9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QQ&W!bR/y+^Y&Q!b&U&]+^+dS(i#y(oS+h&c+kS-a(j(qQ-b(kQ-i(rQ.s*TU0T+i+m+nU0Y+o+p+qS0_+r2tQ1q-hQ1s-jQ1t-kS2o.v2rU3w0W0X0ZQ3{0[Q3|0^S5^2p2wS5a2u2vU6U3x3z3}Q6Z4OS6{5b5cQ6}5dS7f6W6YS7x6|7OQ8V7hQ8`7yQ;X;]R;Z;^lhOSj}!n$Z%b%e%f%h*m*r/d/gQ%j!QS&w!v9YQ)b$fQ*V%OQ*W%PQ+x&hS,Z&|9xS-u)S:UQ.V)cQ.u*UQ/k*tQ/m*uQ/u+XQ0]+oQ0c+yS1{-v:ZQ2U.WS2X.Y:[Q3n/wQ3q0OQ4Q0dQ4z2VQ6O3pQ6S3vQ6[4RQ7`5|Q7c6TQ8R7dQ8e8TR8q8g$W#`Z!_!o%v%|&x'P'V'W'X'Y'Z'[']'^'_'`'a'c'f'j't)n+P+[+e+|,[,b,e,u-t/s/v0f0p0t0u0v0w0x0y0z0{0|0}1O1P1Q1T1Y1z2W3o3r4S4V4W4]4^5Z5}6Q6^6b6c7b7s8S8f8r9U:pW(t#z&{1S8jT)W$_,g$W#_Z!_!o%v%|&x'P'V'W'X'Y'Z'[']'^'_'`'a'c'f'j't)n+P+[+e+|,[,b,e,u-t/s/v0f0p0t0u0v0w0x0y0z0{0|0}1O1P1Q1T1Y1z2W3o3r4S4V4W4]4^5Z5}6Q6^6b6c7b7s8S8f8r9U:pQ'e#`S)V$_,gR-w)W&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&V&^&e&o&|'Q'v(Q)S)Z*i*m*r+R+V+Y+v+},`,f,k-q-v.O.Y.y/[/]/^/`/d/g/i/x0Q0g0q1U2e2m2}3b3d3e3m3t5j5x6R6v7e8U8h9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QQ%e{Q%f|Q%h!OQ%i!PR/c*pQ&d!iQ)X$aQ+u&gS-|)])uS0`+s+tW2O-y-z-{.hS4P0a0bU4w2Q2R2SU6n4v5T5UQ7o6oR8Z7rT+j&c+kS+h&c+kU0T+i+m+nU0Y+o+p+qS0_+r2tS2o.v2rU3w0W0X0ZQ3{0[Q3|0^S5^2p2wS5a2u2vU6U3x3z3}Q6Z4OS6{5b5cQ6}5dS7f6W6YS7x6|7OQ8V7hR8`7yS+j&c+kT2q.v2rS&q!q/aQ-S(^Q-_(iS0S+h2oQ1d-TS1l-`-iU3y0Y0_5aQ4c1_S4n1r1tU6X3{3|6}Q6f4dQ6m4qR7i6ZQ!xXS&p!q/aQ)T$YQ)`$dQ)f$jQ,O&qQ-R(^Q-^(iQ-c(lQ.U)aQ.}*ZS0R+h2oS1c-S-TS1k-_-iQ1n-bQ1p-dQ3R/OW3u0S0Y0_5aQ4b1_Q4f1dS4j1l1tQ4o1sQ5m3SW6V3y3{3|6}S6e4c4dS6i4k:`Q6k4nQ6x5[Q7V5nS7g6X6ZQ7k6fS7l6j:aQ7n6mQ7u6yQ8O7WQ8W7iS8Y7m:bQ8]7vQ8l8^Q8x8mQ9P8yQ:i:dQ:t:nQ:u:oQ:y;XR:{;Z$rWORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&^&e&o&|'Q(Q)S)Z*i*m*r+R+v+},`,f-q-v.O.Y.y/[/]/^/`/d/g/i0Q0g0q2e2}3b3d3e3t5j5x6R7e8U8hS!xn!k!j:c#]#k&V'v+V+Y,k/x1U2m3m6v9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QR:i;P$rXORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&^&e&o&|'Q(Q)S)Z*i*m*r+R+v+},`,f-q-v.O.Y.y/[/]/^/`/d/g/i0Q0g0q2e2}3b3d3e3t5j5x6R7e8U8hQ$Yb!Y$dm!j$g$h$i&T&i&j&k(i)d)e+Z+h+z+{-a.X/}0T0Y0e1q3w3|6U7f8VS$jn!kQ)a$eQ*Z%SW/O*[*]*^*_U3S/P/Q/RQ5[2oS5n3T3UU6y5]5^5aQ7W5oU7v6z6{6}S8^7w7xS8m8_8`Q8y8n!j:d#]#k&V'v+V+Y,k/x1U2m3m6v9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QQ:n;OR:o;P$f]OSTjk}!S!W!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$Z$m%Z%^%b%d%e%f%h%l%y&R&^&e&o&|'Q(Q)S)Z*i*m*r+R+v+},`,f-q-v.O.Y.y/[/]/^/`/d/g/i0Q0g0q2e2}3b3d3e3t5j5x6R7e8U8hY!hRU!]!`%wv$vrs!r!u$X$t&_&s&v)v)w)x*k+W+f,Q,S/l0iQ*h%_!h:e#]#k'v+V+Y,k/x1U2m3m6v9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QR:h&VS&Z!b$uR/{+a$p[ORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$Z$m%Z%^%b%d%e%f%h%l%w%y&R&^&e&o&|'Q(Q)S)Z*i*m*r+R+v+},`,f-q-v.O.Y.y/[/]/^/`/d/g/i0Q0g0q2e2}3b3d3e3t5j5x6R7e8U8h!j'd#]#k&V'v+V+Y,k/x1U2m3m6v9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QR*g%_$roORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&^&e&o&|'Q(Q)S)Z*i*m*r+R+v+},`,f-q-v.O.Y.y/[/]/^/`/d/g/i0Q0g0q2e2}3b3d3e3t5j5x6R7e8U8hQ'T!{!k:f#]#k&V'v+V+Y,k/x1U2m3m6v9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;Q!h#VZ!_$_%v%|&x'P'^'_'`'a'f'j)n+P+e+|,[,b,u-t0f0p1Q1z2W3r4S4V6Q7b8S8f8r9U!R9b'c't+[,g/s/v0t0|0}1O1P1T1Y3o4W4]4^5Z5}6^6b6c7s:p!d#XZ!_$_%v%|&x'P'`'a'f'j)n+P+e+|,[,b,u-t0f0p1Q1z2W3r4S4V6Q7b8S8f8r9U}9d'c't+[,g/s/v0t1O1P1T1Y3o4W4]4^5Z5}6^6b6c7s:p!`#]Z!_$_%v%|&x'P'f'j)n+P+e+|,[,b,u-t0f0p1Q1z2W3r4S4V6Q7b8S8f8r9Un(Y#t&})R,}-V-l-m0n1y4a4r:j:v:w:xx;Q'c't+[,g/s/v0t1T1Y3o4W4]4^5Z5}6^6b6c7s:p!d;U&y'h(](c+t,Y,r-Z-x-{.l.n0b0m1e1i2S2h2j2z4U4h4l4t4y5U5i6]6h6l7T:z:|Y;V8i8v8}9Q9SZ;W1R4[6_7j8X&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&V&^&e&o&|'Q'v(Q)S)Z*i*m*r+R+V+Y+v+},`,f,k-q-v.O.Y.y/[/]/^/`/d/g/i/x0Q0g0q1U2e2m2}3b3d3e3m3t5j5x6R6v7e8U8h9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QS#l`#mR1V,j&e_ORSTU`jk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k#m$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&V&^&e&o&|'Q'v(Q)S)Z*i*m*r+R+V+Y+v+},`,f,j,k-q-v.O.Y.y/[/]/^/`/d/g/i/x0Q0g0q1U2e2m2}3b3d3e3m3t5j5x6R6v7e8U8h9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QS#g^#nT'm#i'qT#h^#nT'o#i'q&e`ORSTU`jk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k#m$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&V&^&e&o&|'Q'v(Q)S)Z*i*m*r+R+V+Y+v+},`,f,j,k-q-v.O.Y.y/[/]/^/`/d/g/i/x0Q0g0q1U2e2m2}3b3d3e3m3t5j5x6R6v7e8U8h9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;QT#l`#mQ#o`R'x#m$rbORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$Z$m%Z%^%_%b%d%e%f%h%l%w%y&R&^&e&o&|'Q(Q)S)Z*i*m*r+R+v+},`,f-q-v.O.Y.y/[/]/^/`/d/g/i0Q0g0q2e2}3b3d3e3t5j5x6R7e8U8h!k;O#]#k&V'v+V+Y,k/x1U2m3m6v9T9V9Y9[9]9^9_9`9a9b9c9d9e9f9g9j9w9x9z:U:V:Z:[;Q#RdOSUj}!S!W!n!|#k$Z%Z%^%_%b%d%e%f%h%l&R&e'v)Z*i*m*r+v,k-q.O.y/[/]/^/`/d/g/i1U2e2}3b3d3e5j5xv#za!y$R$S$W(V(X(Y(a(u(v,]-s1^1u:};U;V;W#Q&{!w#d#v#x&f'|(e)Y)[)_)|*P+w-W-Y-}.P.m.p.x.z1g1o1|2P2T2f2|3O4g4p4x5f5k6u7R7|9n9q9t9{:O:R:W:];Y;[Q)P$UQ,v(Rb1S9i9p9s9v9}:Q:T:Y:_c8j9Z9o9r9u9|:P:S:X:^v#wa!y$R$S$W(V(X(Y(a(u(v,]-s1^1u:};U;V;WS(l#y(oQ)Q$VQ-d(m#Q:k!w#d#v#x&f'|(e)Y)[)_)|*P+w-W-Y-}.P.m.p.x.z1g1o1|2P2T2f2|3O4g4p4x5f5k6u7R7|9n9q9t9{:O:R:W:];Y;[b:l9Z9o9r9u9|:P:S:X:^b:m9i9p9s9v9}:Q:T:Y:_Q:q;RQ:r;SR:s;Tv#za!y$R$S$W(V(X(Y(a(u(v,]-s1^1u:};U;V;W#Q&{!w#d#v#x&f'|(e)Y)[)_)|*P+w-W-Y-}.P.m.p.x.z1g1o1|2P2T2f2|3O4g4p4x5f5k6u7R7|9n9q9t9{:O:R:W:];Y;[b1S9i9p9s9v9}:Q:T:Y:_c8j9Z9o9r9u9|:P:S:X:^lfOSj}!n$Z%b%e%f%h*m*r/d/gQ(d#xQ*{%oQ*|%qR1f-W$n#{a!w!y#d#v#x$R$S$W&f'|(V(X(Y(a(e(u(v)Y)[)_)|*P+w,]-W-Y-s-}.P.m.p.x.z1^1g1o1u1|2P2T2f2|3O4g4p4x5f5k6u7R7|9Z9i9n9o9p9q9r9s9t9u9v9{9|9}:O:P:Q:R:S:T:W:X:Y:]:^:_:};U;V;W;Y;[Q*O$|Q.o*QQ2i.nR5W2jT(n#y(oS(n#y(oT2q.v2rQ)`$dQ-c(lQ.U)aQ.}*ZQ3R/OQ5m3SQ6x5[Q7V5nQ7u6yQ8O7WQ8]7vQ8l8^Q8x8mR9P8yn(V#t&})R,}-V-l-m0n1y4a4r:j:v:w:x!d9{&y'h(](c+t,Y,r-Z-x-{.l.n0b0m1e1i2S2h2j2z4U4h4l4t4y5U5i6]6h6l7T:z:|Y9|8i8v8}9Q9SZ9}1R4[6_7j8Xp(X#t&})R,{,}-V-l-m0n1y4a4r:j:v:w:x!f:O&y'h(](c+t,Y,r-Z-x-{.l.n0b0k0m1e1i2S2h2j2z4U4h4l4t4y5U5i6]6h6l7T:z:|[:P8i8v8{8}9Q9S]:Q1R4[6_6`7j8XpeOSjy}!n$Z%X%b%e%f%h*m*r/d/gQ%UxR*i%_peOSjy}!n$Z%X%b%e%f%h*m*r/d/gR%UxQ*S$}R.k){qeOSjy}!n$Z%X%b%e%f%h*m*r/d/gQ.w*XS2{.{.|W5e2x2y2z3PU7Q5g5h5iU7z7P7S7TQ8a7{R8o8bQ%]yR*c%XR3Y/UR7Y5pS$lp$qR.a)lQ%bzR*m%cR*s%iT/e*r/gR*w%jQ*v%jR/n*wQjOQ!nST$^j!nQ(O#sR,s(OQ!YQR%t!YQ!^RU%z!^%{+SQ%{!_R+S%|Q+_&WR/z+_Q,^&}R0o,^Q,a'PS0r,a0sR0s,bQ+k&cR0U+kS!eR$tU&`!e&a+TQ&a!fR+T%}Q+b&ZR/|+bQ&t!sQ,P&rU,T&t,P0jR0j,UQ'q#iR,l'qQ#m`R'w#mQ#cZU'g#c+O9hQ+O9UR9h'tQ-Q(^W1a-Q1b4e6gU1b-R-S-TS4e1c1dR6g4f$Z(T#t&y&}'h(](c(|(})R+t,W,X,Y,r,{,|,}-V-Z-l-m-x-{.l.n0b0k0l0m0n1R1e1i1y2S2h2j2z4U4Y4Z4[4a4h4l4r4t4y5U5i6]6_6`6a6h6l7T7j8X8i8t8u8v8{8|8}9Q9S:j:v:w:x:z:|Q-X(cU1h-X1j4iQ1j-ZR4i1iQ(o#yR-f(oQ(x#}R-o(xQ1}-xR4u1}Q)y$wR.j)yQ2l.qS5Y2l6wR6w5ZQ*U%OR.t*UQ2r.vR5_2rQ/T*`S3W/T5qR5q3YQ.[)hW2].[2_5O6rQ2_._Q5O2^R6r5PQ)m$lR.b)mQ/g*rR3h/gWiOSj!nQ%g}Q)U$ZQ*l%bQ*n%eQ*o%fQ*q%hQ/b*mS/e*r/gR3g/dQ$]gQ%k!RQ%n!TQ%p!UQ%r!VQ)t$rQ)z$xQ*b%]Q*y%mQ-e(nS/W*c*fQ/o*xQ/p*{Q/q*|S0P+h2oQ2b.eQ2g.lQ3Q.}Q3[/YQ3f/cY3s0R0S0Y0_5aQ5S2dQ5V2hQ5l3RQ5r3Z[6P3r3u3y3{3|6}Q6s5QQ7U5mQ7Z5sW7a6Q6V6X6ZQ7q6tQ7t6xQ7}7VU8Q7b7g7iQ8[7uQ8c8OS8d8S8WQ8k8]Q8p8fQ8w8lQ8z8rQ9O8xR9R9PQ$fmQ&h!jU)c$g$h$iQ+X&TU+y&i&j&kQ-](iS.W)d)eQ/w+ZQ0O+hS0d+z+{Q1m-aQ2V.XQ3p/}S3v0T0YQ4R0eQ4m1qS6T3w3|Q7d6UQ8T7fR8g8VS#ua:}R)^$cU#}a$c:}R-n(wQ#taS&y!w)_Q&}!yQ'h#dQ(]#vQ(c#xQ(|$RQ(}$SQ)R$WQ+t&fQ,W9nQ,X9qQ,Y9tQ,r'|Q,{(VQ,|(XQ,}(YQ-V(aQ-Z(eQ-l(uQ-m(vd-x)Y-}.x2P2|4x5f6u7R7|Q-{)[Q.l)|Q.n*PQ0b+wQ0k9{Q0l:OQ0m:RQ0n,]Q1R9iQ1e-WQ1i-YQ1y-sQ2S.PQ2h.mQ2j.pQ2z.zQ4U:WQ4Y9pQ4Z9sQ4[9vQ4a1^Q4h1gQ4l1oQ4r1uQ4t1|Q4y2TQ5U2fQ5i3OQ6]:]Q6_:TQ6`9}Q6a:QQ6h4gQ6l4pQ7T5kQ7j:YQ8X:_Q8i9ZQ8t9oQ8u9rQ8v9uQ8{9|Q8|:PQ8}:SQ9Q:XQ9S:^Q:j:}Q:v;UQ:w;VQ:x;WQ:z;YR:|;[lgOSj}!n$Z%b%e%f%h*m*r/d/gS!pU%dQ%m!SQ%s!WQ'U!|Q'u#kS*f%Z%^Q*j%_Q*x%lQ+U&RQ+s&eQ,p'vQ-z)ZQ/_*iQ0a+vQ1X,kQ1w-qQ2R.OQ2y.yQ3^/[Q3_/]Q3a/^Q3c/`Q3j/iQ4_1UQ5T2eQ5h2}Q5w3bQ5y3dQ5z3eQ7S5jR7]5x!vZOSUj}!S!n!|$Z%Z%^%_%b%d%e%f%h%l&R&e)Z*i*m*r+v-q.O.y/[/]/^/`/d/g/i2e2}3b3d3e5j5xQ!_RQ!oTQ$_kS%v!]%yQ%|!`Q&x!vQ'P!zQ'V#PQ'W#QQ'X#RQ'Y#SQ'Z#TQ'[#UQ']#VQ'^#WQ'_#XQ'`#YQ'a#ZQ'c#]Q'f#bQ'j#eW't#k'v,k1UQ)n$mS+P%w+RS+[&V/xQ+e&^Q+|&oQ,[&|Q,b'QQ,e9TQ,g9VQ,u(QQ-t)SQ/s+VQ/v+YQ0f+}Q0p,`Q0t9YQ0u9[Q0v9]Q0w9^Q0x9_Q0y9`Q0z9aQ0{9bQ0|9cQ0}9dQ1O9eQ1P9fQ1Q,fQ1T9jQ1Y9gQ1z-vQ2W.YQ3o9wQ3r0QQ4S0gQ4V0qQ4W9xQ4]9zQ4^:UQ5Z2mQ5}3mQ6Q3tQ6^:VQ6b:ZQ6c:[Q7b6RQ7s6vQ8S7eQ8f8UQ8r8hQ9U!WR:p;QR!aRR&X!bS&T!b+^S+Z&U&]R/}+dR'O!yR'R!zT!tU$XS!sU$XU$wrs*kS&r!r!uQ,R&sQ,U&vQ.i)xS0h,Q,SR4T0i`!dR!]!`$t%w&_)v+fh!qUrs!r!u$X&s&v)x,Q,S0iQ/a*kQ/t+WQ3l/lT:g&V)wT!gR$tS!fR$tS%x!]&_S%}!`)vS+Q%w+fT+]&V)wT&[!b$uQ#i^R'z#nT'p#i'qR1W,jT(`#v(hR(f#xQ-y)YQ2Q-}Q2x.xQ4v2PQ5g2|Q6o4xQ7P5fQ7r6uQ7{7RR8b7|lhOSj}!n$Z%b%e%f%h*m*r/d/gQ%[yR*b%XV$xrs*kR.r*RR*a%VQ$ppR)s$qR)i$kT%`z%cT%az%cT/f*r/g",
  nodeNames: "⚠ ArithOp ArithOp InterpolationStart extends LineComment BlockComment Script ExportDeclaration export Star as VariableName String from ; default FunctionDeclaration async function VariableDefinition TypeParamList TypeDefinition ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString Interpolation null super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression await yield delete LogicOp BitOp ParenthesizedExpression ClassExpression class extends ClassBody MethodDeclaration Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression PrivatePropertyName BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement",
  maxTerm: 332,
  context: trackNewline,
  nodeProps: [
    ["closedBy", 3,"InterpolationEnd",40,"]",51,"}",66,")",132,"JSXSelfCloseEndTag JSXEndTag",146,"JSXEndTag"],
    ["group", -26,8,15,17,58,184,188,191,192,194,197,200,211,213,219,221,223,225,228,234,240,242,244,246,248,250,251,"Statement",-30,12,13,24,27,28,41,43,44,45,47,52,60,68,74,75,91,92,101,103,119,122,124,125,126,127,129,130,148,149,151,"Expression",-22,23,25,29,32,34,152,154,156,157,159,160,161,163,164,165,167,168,169,178,180,182,183,"Type",-3,79,85,90,"ClassItem"],
    ["openedBy", 30,"InterpolationStart",46,"[",50,"{",65,"(",131,"JSXStartTag",141,"JSXStartTag JSXStartCloseTag"]
  ],
  propSources: [jsHighlight],
  skippedNodes: [0,5,6],
  repeatNodeCount: 28,
  tokenData: "!C}~R!`OX%TXY%cYZ'RZ[%c[]%T]^'R^p%Tpq%cqr'crs(kst0htu2`uv4pvw5ewx6cxy<yyz=Zz{=k{|>k|}?O}!O>k!O!P?`!P!QCl!Q!R!0[!R![!1q![!]!7s!]!^!8V!^!_!8g!_!`!9d!`!a!:[!a!b!<R!b!c%T!c!}2`!}#O!=d#O#P%T#P#Q!=t#Q#R!>U#R#S2`#S#T!>i#T#o2`#o#p!>y#p#q!?O#q#r!?f#r#s!?x#s$f%T$f$g%c$g#BY2`#BY#BZ!@Y#BZ$IS2`$IS$I_!@Y$I_$I|2`$I|$I}!Bq$I}$JO!Bq$JO$JT2`$JT$JU!@Y$JU$KV2`$KV$KW!@Y$KW&FU2`&FU&FV!@Y&FV?HT2`?HT?HU!@Y?HU~2`W%YR$UWO!^%T!_#o%T#p~%T7Z%jg$UW'Y7ROX%TXY%cYZ%TZ[%c[p%Tpq%cq!^%T!_#o%T#p$f%T$f$g%c$g#BY%T#BY#BZ%c#BZ$IS%T$IS$I_%c$I_$JT%T$JT$JU%c$JU$KV%T$KV$KW%c$KW&FU%T&FU&FV%c&FV?HT%T?HT?HU%c?HU~%T7Z'YR$UW'Z7RO!^%T!_#o%T#p~%T$T'jS$UW!j#{O!^%T!_!`'v!`#o%T#p~%T$O'}S#e#v$UWO!^%T!_!`(Z!`#o%T#p~%T$O(bR#e#v$UWO!^%T!_#o%T#p~%T'u(rZ$UW]!ROY(kYZ)eZr(krs*rs!^(k!^!_+U!_#O(k#O#P-b#P#o(k#o#p+U#p~(k&r)jV$UWOr)ers*Ps!^)e!^!_*a!_#o)e#o#p*a#p~)e&r*WR$P&j$UWO!^%T!_#o%T#p~%T&j*dROr*ars*ms~*a&j*rO$P&j'u*{R$P&j$UW]!RO!^%T!_#o%T#p~%T'm+ZV]!ROY+UYZ*aZr+Urs+ps#O+U#O#P+w#P~+U'm+wO$P&j]!R'm+zROr+Urs,Ts~+U'm,[U$P&j]!ROY,nZr,nrs-Vs#O,n#O#P-[#P~,n!R,sU]!ROY,nZr,nrs-Vs#O,n#O#P-[#P~,n!R-[O]!R!R-_PO~,n'u-gV$UWOr(krs-|s!^(k!^!_+U!_#o(k#o#p+U#p~(k'u.VZ$P&j$UW]!ROY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x!Z/PZ$UW]!ROY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x!Z/yR$UW]!RO!^%T!_#o%T#p~%T!Z0XT$UWO!^.x!^!_,n!_#o.x#o#p,n#p~.x2k0mZ$UWOt%Ttu1`u!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`2k1g]$UW'o2cOt%Ttu1`u!Q%T!Q![1`![!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`7Z2k_$UW#zS']%k'g2bOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`[3q_$UW#zSOt%Ttu3ju}%T}!O3j!O!Q%T!Q![3j![!^%T!_!c%T!c!}3j!}#R%T#R#S3j#S#T%T#T#o3j#p$g%T$g~3j$O4wS#^#v$UWO!^%T!_!`5T!`#o%T#p~%T$O5[R$UW#o#vO!^%T!_#o%T#p~%T6d5lU'x6[$UWOv%Tvw6Ow!^%T!_!`5T!`#o%T#p~%T$O6VS$UW#i#vO!^%T!_!`5T!`#o%T#p~%T'u6jZ$UW]!ROY6cYZ7]Zw6cwx*rx!^6c!^!_8T!_#O6c#O#P:T#P#o6c#o#p8T#p~6c&r7bV$UWOw7]wx*Px!^7]!^!_7w!_#o7]#o#p7w#p~7]&j7zROw7wwx*mx~7w'm8YV]!ROY8TYZ7wZw8Twx+px#O8T#O#P8o#P~8T'm8rROw8Twx8{x~8T'm9SU$P&j]!ROY9fZw9fwx-Vx#O9f#O#P9}#P~9f!R9kU]!ROY9fZw9fwx-Vx#O9f#O#P9}#P~9f!R:QPO~9f'u:YV$UWOw6cwx:ox!^6c!^!_8T!_#o6c#o#p8T#p~6c'u:xZ$P&j$UW]!ROY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k!Z;rZ$UW]!ROY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k!Z<jT$UWO!^;k!^!_9f!_#o;k#o#p9f#p~;k%V=QR!d$}$UWO!^%T!_#o%T#p~%TZ=bR!cR$UWO!^%T!_#o%T#p~%T5s=tU'^2s#_#v$UWOz%Tz{>W{!^%T!_!`5T!`#o%T#p~%T$O>_S#[#v$UWO!^%T!_!`5T!`#o%T#p~%T$u>rSj$m$UWO!^%T!_!`5T!`#o%T#p~%T&i?VR!R&a$UWO!^%T!_#o%T#p~%T7Z?gVu6`$UWO!O%T!O!P?|!P!Q%T!Q![@r![!^%T!_#o%T#p~%Ty@RT$UWO!O%T!O!P@b!P!^%T!_#o%T#p~%Ty@iR!Qq$UWO!^%T!_#o%T#p~%Ty@yZ$UWkqO!Q%T!Q![@r![!^%T!_!g%T!g!hAl!h#R%T#R#S@r#S#X%T#X#YAl#Y#o%T#p~%TyAqZ$UWO{%T{|Bd|}%T}!OBd!O!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%TyBiV$UWO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%TyCVV$UWkqO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T7ZCs`$UW#]#vOYDuYZ%TZzDuz{Jl{!PDu!P!Q!-e!Q!^Du!^!_Fx!_!`!.^!`!a!/]!a!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXD|[$UW}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXEy_$UW}PO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%TPF}V}POYFxZ!PFx!P!QGd!Q!}Fx!}#OG{#O#PHh#P~FxPGiU}P#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGdPHOTOYG{Z#OG{#O#PH_#P#QFx#Q~G{PHbQOYG{Z~G{PHkQOYFxZ~FxXHvY$UWOYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~HqXIkV$UWOYHqYZ%TZ!^Hq!^!_G{!_#oHq#o#pG{#p~HqXJVV$UWOYDuYZ%TZ!^Du!^!_Fx!_#oDu#o#pFx#p~Du7ZJs^$UW}POYJlYZKoZzJlz{NQ{!PJl!P!Q!,R!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl7ZKtV$UWOzKoz{LZ{!^Ko!^!_M]!_#oKo#o#pM]#p~Ko7ZL`X$UWOzKoz{LZ{!PKo!P!QL{!Q!^Ko!^!_M]!_#oKo#o#pM]#p~Ko7ZMSR$UWU7RO!^%T!_#o%T#p~%T7RM`ROzM]z{Mi{~M]7RMlTOzM]z{Mi{!PM]!P!QM{!Q~M]7RNQOU7R7ZNX^$UW}POYJlYZKoZzJlz{NQ{!PJl!P!Q! T!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl7Z! ^_$UWU7R}PO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%T7R!!bY}POY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!&x!Q!}!!]!}#O!$`#O#P!&f#P~!!]7R!#VY}POY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!#u!Q!}!!]!}#O!$`#O#P!&f#P~!!]7R!#|UU7R}P#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGd7R!$cWOY!$`YZM]Zz!$`z{!${{#O!$`#O#P!&S#P#Q!!]#Q~!$`7R!%OYOY!$`YZM]Zz!$`z{!${{!P!$`!P!Q!%n!Q#O!$`#O#P!&S#P#Q!!]#Q~!$`7R!%sTU7ROYG{Z#OG{#O#PH_#P#QFx#Q~G{7R!&VTOY!$`YZM]Zz!$`z{!${{~!$`7R!&iTOY!!]YZM]Zz!!]z{!#Q{~!!]7R!&}_}POzM]z{Mi{#ZM]#Z#[!&x#[#]M]#]#^!&x#^#aM]#a#b!&x#b#gM]#g#h!&x#h#iM]#i#j!&x#j#mM]#m#n!&x#n~M]7Z!(R[$UWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|7Z!(|^$UWOY!'|YZKoZz!'|z{!(w{!P!'|!P!Q!)x!Q!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|7Z!*PY$UWU7ROYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~Hq7Z!*tX$UWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#o!'|#o#p!$`#p~!'|7Z!+fX$UWOYJlYZKoZzJlz{NQ{!^Jl!^!_!!]!_#oJl#o#p!!]#p~Jl7Z!,Yc$UW}POzKoz{LZ{!^Ko!^!_M]!_#ZKo#Z#[!,R#[#]Ko#]#^!,R#^#aKo#a#b!,R#b#gKo#g#h!,R#h#iKo#i#j!,R#j#mKo#m#n!,R#n#oKo#o#pM]#p~Ko7Z!-lV$UWT7ROY!-eYZ%TZ!^!-e!^!_!.R!_#o!-e#o#p!.R#p~!-e7R!.WQT7ROY!.RZ~!.R$P!.g[$UW#o#v}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Du]!/f[#wS$UW}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Duy!0cd$UWkqO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#U%T#U#V!3X#V#X%T#X#YAl#Y#b%T#b#c!2w#c#d!4m#d#l%T#l#m!5{#m#o%T#p~%Ty!1x_$UWkqO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#X%T#X#YAl#Y#b%T#b#c!2w#c#o%T#p~%Ty!3OR$UWkqO!^%T!_#o%T#p~%Ty!3^W$UWO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#o%T#p~%Ty!3}Y$UWkqO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#b%T#b#c!2w#c#o%T#p~%Ty!4rV$UWO!Q%T!Q!Y!5X!Y!^%T!_#R%T#R#S!5X#S#o%T#p~%Ty!5`X$UWkqO!Q%T!Q!Y!5X!Y!^%T!_#R%T#R#S!5X#S#b%T#b#c!2w#c#o%T#p~%Ty!6QZ$UWO!Q%T!Q![!6s![!^%T!_!c%T!c!i!6s!i#R%T#R#S!6s#S#T%T#T#Z!6s#Z#o%T#p~%Ty!6z]$UWkqO!Q%T!Q![!6s![!^%T!_!c%T!c!i!6s!i#R%T#R#S!6s#S#T%T#T#Z!6s#Z#b%T#b#c!2w#c#o%T#p~%T%w!7|R!]V$UW#m%hO!^%T!_#o%T#p~%T!P!8^R_w$UWO!^%T!_#o%T#p~%T6i!8rR'bd!a0`#x&s'|P!P!Q!8{!^!_!9Q!_!`!9_W!9QO$WW#v!9VP#`#v!_!`!9Y#v!9_O#o#v#v!9dO#a#v%w!9kT!{%o$UWO!^%T!_!`'v!`!a!9z!a#o%T#p~%T$P!:RR#W#w$UWO!^%T!_#o%T#p~%T%w!:gT'a!s#a#v$RS$UWO!^%T!_!`!:v!`!a!;W!a#o%T#p~%T$O!:}R#a#v$UWO!^%T!_#o%T#p~%T$O!;_T#`#v$UWO!^%T!_!`5T!`!a!;n!a#o%T#p~%T$O!;uS#`#v$UWO!^%T!_!`5T!`#o%T#p~%T6i!<YV'p6a$UWO!O%T!O!P!<o!P!^%T!_!a%T!a!b!=P!b#o%T#p~%T)z!<vRv)r$UWO!^%T!_#o%T#p~%T$O!=WS$UW#j#vO!^%T!_!`5T!`#o%T#p~%T7V!=kRx6}$UWO!^%T!_#o%T#p~%TZ!={R!OR$UWO!^%T!_#o%T#p~%T$O!>]S#g#v$UWO!^%T!_!`5T!`#o%T#p~%T$P!>pR$UW'f#wO!^%T!_#o%T#p~%T~!?OO!T~6d!?VT'w6[$UWO!^%T!_!`5T!`#o%T#p#q!=P#q~%T5g!?oR!S5]nQ$UWO!^%T!_#o%T#p~%TX!@PR!kP$UWO!^%T!_#o%T#p~%T7Z!@gr$UW'Y7R#zS']%k'g2bOX%TXY%cYZ%TZ[%c[p%Tpq%cqt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$f%T$f$g%c$g#BY2`#BY#BZ!@Y#BZ$IS2`$IS$I_!@Y$I_$JT2`$JT$JU!@Y$JU$KV2`$KV$KW!@Y$KW&FU2`&FU&FV!@Y&FV?HT2`?HT?HU!@Y?HU~2`7Z!CO_$UW'Z7R#zS']%k'g2bOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`",
  tokenizers: [noSemicolon, incdecToken, template, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, insertSemicolon],
  topRules: {"Script":[0,7]},
  dialects: {jsx: 11707, ts: 11709},
  dynamicPrecedences: {"149":1,"176":1},
  specialized: [{term: 289, get: (value, stack) => (tsExtends(value, stack) << 1)},{term: 289, get: value => spec_identifier[value] || -1},{term: 299, get: value => spec_word[value] || -1},{term: 63, get: value => spec_LessThan[value] || -1}],
  tokenPrec: 11730
});

const snippets = [
    snippetCompletion("function ${name}(${params}) {\n\t${}\n}", {
        label: "function",
        detail: "definition",
        type: "keyword"
    }),
    snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
        label: "for",
        detail: "loop",
        type: "keyword"
    }),
    snippetCompletion("for (let ${name} of ${collection}) {\n\t${}\n}", {
        label: "for",
        detail: "of loop",
        type: "keyword"
    }),
    snippetCompletion("try {\n\t${}\n} catch (${error}) {\n\t${}\n}", {
        label: "try",
        detail: "block",
        type: "keyword"
    }),
    snippetCompletion("class ${name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}", {
        label: "class",
        detail: "definition",
        type: "keyword"
    }),
    snippetCompletion("import {${names}} from \"${module}\"\n${}", {
        label: "import",
        detail: "named",
        type: "keyword"
    }),
    snippetCompletion("import ${name} from \"${module}\"\n${}", {
        label: "import",
        detail: "default",
        type: "keyword"
    })
];

const javascriptLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                IfStatement: continuedIndent({ except: /^\s*({|else\b)/ }),
                TryStatement: continuedIndent({ except: /^\s*({|catch\b|finally\b)/ }),
                LabeledStatement: flatIndent,
                SwitchBody: context => {
                    let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
                    return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
                },
                Block: delimitedIndent({ closing: "}" }),
                ArrowFunction: cx => cx.baseIndent + cx.unit,
                "TemplateString BlockComment": () => -1,
                "Statement Property": continuedIndent({ except: /^{/ }),
                JSXElement(context) {
                    let closed = /^\s*<\//.test(context.textAfter);
                    return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
                },
                JSXEscape(context) {
                    let closed = /\s*\}/.test(context.textAfter);
                    return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
                },
                "JSXOpenTag JSXSelfClosingTag"(context) {
                    return context.column(context.node.from) + context.unit;
                }
            }),
            foldNodeProp.add({
                "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": foldInside,
                BlockComment(tree) { return { from: tree.from + 2, to: tree.to - 2 }; }
            })
        ]
    }),
    languageData: {
        closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
        commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
        indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
        wordChars: "$"
    }
});

const typescriptLanguage = javascriptLanguage.configure({ dialect: "ts" });
const jsxLanguage = javascriptLanguage.configure({ dialect: "jsx" });
const tsxLanguage = javascriptLanguage.configure({ dialect: "jsx ts" });

function javascript(config = {}) {
    let lang = config.jsx ? (config.typescript ? tsxLanguage : jsxLanguage) : config.typescript ? typescriptLanguage : javascriptLanguage;
    return new LanguageSupport(lang, [
        javascriptLanguage.data.of({
            autocomplete: ifNotIn(["LineComment", "BlockComment", "String"], completeFromList(snippets))
        }),
        config.jsx ? autoCloseTags : [],
    ]);
}

function elementName(doc, tree, max = doc.length) {
    if (!tree) return "";
    let name = tree.getChild("JSXIdentifier");
    return name ? doc.sliceString(name.from, Math.min(name.to, max)) : "";
}

const javascript_android = typeof navigator == "object" && /Android\b/.test(navigator.userAgent);

// Extension that will automatically insert JSX close tags when a `>` or `/` is typed.
const autoCloseTags = editorview/* EditorView.inputHandler.of */.t.inputHandler.of((view, from, to, text) => {
    if ((javascript_android ? view.composing : view.compositionStarted) || view.state.readOnly ||
        from != to || (text != ">" && text != "/") ||
        !javascriptLanguage.isActiveAt(view.state, from, -1))
        return false;
    let { state } = view;
    let changes = state.changeByRange(range => {
        var _a, _b, _c;
        let { head } = range, around = language_syntaxTree(state).resolveInner(head, -1), name;
        if (around.name == "JSXStartTag")
            around = around.parent;
        if (text == ">" && around.name == "JSXFragmentTag") {
            return { range: dist_state/* EditorSelection.cursor */.jT.cursor(head + 1), changes: { from: head, insert: `><>` } };
        } else if (text == ">" && around.name == "JSXIdentifier") {
            if (((_b = (_a = around.parent) === null || _a === void 0 ? void 0 : _a.lastChild) === null || _b === void 0 ? void 0 : _b.name) != "JSXEndTag" && (name = elementName(state.doc, around.parent, head)))
                return { range: dist_state/* EditorSelection.cursor */.jT.cursor(head + 1), changes: { from: head, insert: `></${name}>` } };
        } else if (text == "/" && around.name == "JSXFragmentTag") {
            let empty = around.parent, base = empty === null || empty === void 0 ? void 0 : empty.parent;
            if (empty.from == head - 1 && ((_c = base.lastChild) === null || _c === void 0 ? void 0 : _c.name) != "JSXEndTag" && (name = elementName(state.doc, base === null || base === void 0 ? void 0 : base.firstChild, head))) {
                let insert = `/${name}>`;
                return { range: dist_state/* EditorSelection.cursor */.jT.cursor(head + insert.length), changes: { from: head, insert } };
            }
        }
        return { range };
    });
    if (changes.changes.empty)
        return false;
    view.dispatch(changes, { userEvent: "input.type", scrollIntoView: true });
    return true;
});

function esLint(eslint, config) {
    if (!config) {
        config = {
            parserOptions: { ecmaVersion: 2019, sourceType: "module" },
            env: { browser: true, node: true, es6: true, es2015: true, es2017: true, es2020: true },
            rules: {}
        };
        eslint.getRules().forEach((desc, name) => {
            if (desc.meta.docs.recommended)
                config.rules[name] = 2;
        });
    }
    return (view) => {
        let { state } = view, found = [];
        for (let { from, to } of javascriptLanguage.findRegions(state)) {
            let fromLine = state.doc.lineAt(from), offset = { line: fromLine.number - 1, col: from - fromLine.from, pos: from };
            for (let d of eslint.verify(state.sliceDoc(from, to), config))
                found.push(translateDiagnostic(d, state.doc, offset));
        }
        return found;
    };
}

function mapPos(line, col, doc, offset) {
    return doc.line(line + offset.line).from + col + (line == 1 ? offset.col - 1 : -1);
}

function translateDiagnostic(input, doc, offset) {
    let start = mapPos(input.line, input.column, doc, offset);
    let result = {
        from: start,
        to: input.endLine != null && input.endColumn != 1 ? mapPos(input.endLine, input.endColumn, doc, offset) : start,
        message: input.message,
        source: input.ruleId ? "jshint:" + input.ruleId : "jshint",
        severity: input.severity == 1 ? "warning" : "error",
    };
    if (input.fix) {
        let { range, text } = input.fix, from = range[0] + offset.pos - start, to = range[1] + offset.pos - start;
        result.actions = [{
            name: "fix",
            apply(view, start) {
                view.dispatch({ changes: { from: start + from, to: start + to, insert: text }, scrollIntoView: true });
            }
        }];
    }
    return result;
}



;// CONCATENATED MODULE: ./sys/public/js/editor/dist/glsl.js



function Context(indented, column, type, info, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.info = info;
    this.align = align;
    this.prev = prev;
}

function pushContext(state, col, type, info) {
    let indent = state.indented;
    if (state.context && state.context.type == "statement" && type != "statement")
        indent = state.context.indented;
    return state.context = new Context(indent, col, type, info, null, state.context);
}

function popContext(state) {
    let t = state.context.type;
    if (t == ")" || t == "]" || t == "}")
        state.indented = state.context.indented;
    return state.context = state.context.prev;
}

function typeBefore(stream, state, pos) {
    if (state.prevToken == "variable" || state.prevToken == "type") return true;
    if (/\S(?:[^- ]>|[*\]])\s*$|\*$/.test(stream.string.slice(0, pos))) return true;
    if (state.typeAtEndOfLine && stream.column() == stream.indentation()) return true;
}

function isTopScope(context) {
    for (;;) {
        if (!context || context.type == "top") return true;
        if (context.type == "}" && context.prev.info != "namespace") return false;
        context = context.prev;
    }
}

function words(str) {
    let obj = {}, words = str.split(" ");
    for (let i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
}

function contains(words, word) {
    return typeof words === "function" ? words(word) : words.propertyIsEnumerable(word);
}

function langHook(stream, state) {
    if (!state.startOfLine) return false
    for (var ch, next = null; ch = stream.peek();) {
        if (ch == "\\" && stream.match(/^.$/)) {
            next = langHook;
            break;
        } else if (ch == "/" && stream.match(/^\/[\/\*]/, false)) {
            break;
        }
        stream.next();
    }
    state.tokenize = next;
    return "meta";
}

const glslKeywords = words(
    "sampler1D sampler2D sampler3D samplerCube " +
    "sampler1DShadow sampler2DShadow " +
    "const attribute uniform varying " +
    "break continue discard return " +
    "for while do if else struct " +
    "in out inout");

const glslTypes = words(
    "float int bool void " +
    "vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 " +
    "mat2 mat3 mat4"
);

const glslParams = words("ifdef endif def")

const shaderLanguage = (parserConfig = {}) => {
    let statementIndentUnit = parserConfig.statementIndentUnit,
        dontAlignCalls = parserConfig.dontAlignCalls,
        keywords = glslKeywords,
        types = glslTypes,
        builtin = words("radians degrees sin cos tan asin acos atan " +
            "pow exp log exp2 sqrt inversesqrt " +
            "abs sign floor ceil fract mod min max clamp mix step smoothstep " +
            "length distance dot cross normalize ftransform faceforward " +
            "reflect refract matrixCompMult " +
            "lessThan lessThanEqual greaterThan greaterThanEqual " +
            "equal notEqual any all not " +
            "texture1D texture1DProj texture1DLod texture1DProjLod " +
            "texture2D texture2DProj texture2DLod texture2DProjLod " +
            "texture3D texture3DProj texture3DLod texture3DProjLod " +
            "textureCube textureCubeLod " +
            "shadow1D shadow2D shadow1DProj shadow2DProj " +
            "shadow1DLod shadow2DLod shadow1DProjLod shadow2DProjLod " +
            "dFdx dFdy fwidth " +
            "noise1 noise2 noise3 noise4"),
        blockKeywords = words("for while do if else struct switch case"),
        defKeywords = parserConfig.defKeywords || {},
        atoms = words("true false null " +
            "gl_FragColor gl_SecondaryColor gl_Normal gl_Vertex " +
            "gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 gl_MultiTexCoord3 " +
            "gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 " +
            "gl_FogCoord gl_PointCoord " +
            "gl_Position gl_PointSize gl_ClipVertex " +
            "gl_FrontColor gl_BackColor gl_FrontSecondaryColor gl_BackSecondaryColor " +
            "gl_TexCoord gl_FogFragCoord " +
            "gl_FragCoord gl_FrontFacing " +
            "gl_FragData gl_FragDepth " +
            "gl_ModelViewMatrix gl_ProjectionMatrix gl_ModelViewProjectionMatrix " +
            "gl_TextureMatrix gl_NormalMatrix gl_ModelViewMatrixInverse " +
            "gl_ProjectionMatrixInverse gl_ModelViewProjectionMatrixInverse " +
            "gl_TextureMatrixTranspose gl_ModelViewMatrixInverseTranspose " +
            "gl_ProjectionMatrixInverseTranspose " +
            "gl_ModelViewProjectionMatrixInverseTranspose " +
            "gl_TextureMatrixInverseTranspose " +
            "gl_NormalScale gl_DepthRange gl_ClipPlane " +
            "gl_Point gl_FrontMaterial gl_BackMaterial gl_LightSource gl_LightModel " +
            "gl_FrontLightModelProduct gl_BackLightModelProduct " +
            "gl_TextureColor gl_EyePlaneS gl_EyePlaneT gl_EyePlaneR gl_EyePlaneQ " +
            "gl_FogParameters " +
            "gl_MaxLights gl_MaxClipPlanes gl_MaxTextureUnits gl_MaxTextureCoords " +
            "gl_MaxVertexAttribs gl_MaxVertexUniformComponents gl_MaxVaryingFloats " +
            "gl_MaxVertexTextureImageUnits gl_MaxTextureImageUnits " +
            "gl_MaxFragmentUniformComponents gl_MaxCombineTextureImageUnits " +
            "gl_MaxDrawBuffers"),
        hooks = { "#": langHook },
        multiLineStrings = parserConfig.multiLineStrings,
        indentStatements = parserConfig.indentStatements !== false,
        indentSwitch = false,
        namespaceSeparator = parserConfig.namespaceSeparator,
        isPunctuationChar = parserConfig.isPunctuationChar || /[\[\]{}\(\),;\:\.]/,
        numberStart = parserConfig.numberStart || /[\d\.]/,
        number = parserConfig.number || /^(?:0x[a-f\d]+|0b[01]+|(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(u|ll?|l|f)?/i,
        isOperatorChar = parserConfig.isOperatorChar || /[+\-*&%=<>!?|\/]/,
        isIdentifierChar = parserConfig.isIdentifierChar || /[\w\$_\xa1-\uffff]/,
        // An optional function that takes a {string} token and returns true if it
        // should be treated as a builtin.
        isReservedIdentifier = parserConfig.isReservedIdentifier || false;

    let curPunc, isDefKeyword;

    function tokenBase(stream, state) {
        let ch = stream.next();
        if (hooks[ch]) {
            var result = hooks[ch](stream, state);
            if (result !== false) return result;
        }
        if (ch == '"' || ch == "'") {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }
        if (numberStart.test(ch)) {
            stream.backUp(1)
            if (stream.match(number)) return "number"
            stream.next()
        }
        if (isPunctuationChar.test(ch)) {
            curPunc = ch;
            return null;
        }
        if (ch == "/") {
            if (stream.eat("*")) {
                state.tokenize = tokenComment;
                return tokenComment(stream, state);
            }
            if (stream.eat("/")) {
                stream.skipToEnd();
                return "comment";
            }
        }
        if (isOperatorChar.test(ch)) {
            while (!stream.match(/^\/[\/*]/, false) && stream.eat(isOperatorChar)) {}
            return "operator";
        }
        stream.eatWhile(isIdentifierChar);
        if (namespaceSeparator) while (stream.match(namespaceSeparator))
            stream.eatWhile(isIdentifierChar);

        let cur = stream.current();
        if (contains(keywords, cur)) {
            if (contains(blockKeywords, cur)) curPunc = "newstatement";
            if (contains(defKeywords, cur)) isDefKeyword = true;
            return "keyword";
        }
        if (contains(types, cur)) return "type";
        if (contains(builtin, cur) || (isReservedIdentifier && isReservedIdentifier(cur))) {
            if (contains(blockKeywords, cur)) curPunc = "newstatement";
            return "builtin";
        }
        if (contains(atoms, cur)) return "atom";
        return "variable";
    }

    function tokenString(quote) {
        return function(stream, state) {
            let escaped = false, next, end = false;
            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) {end = true; break;}
                escaped = !escaped && next == "\\";
            }
            if (end || !(escaped || multiLineStrings))
                state.tokenize = null;
            return "string";
        };
    }

    function tokenComment(stream, state) {
        let maybeEnd = false, ch;
        while (ch = stream.next()) {
            if (ch == "/" && maybeEnd) {
                state.tokenize = null;
                break;
            }
            maybeEnd = (ch == "*");
        }
        return "comment";
    }

    function maybeEOL(stream, state) {
        if (parserConfig.typeFirstDefinitions && stream.eol() && isTopScope(state.context))
            state.typeAtEndOfLine = typeBefore(stream, state, stream.pos)
    }

    // Interface

    return {
        startState: function(indentUnit) {
            return {
                tokenize: null,
                context: new Context(-indentUnit, 0, "top", null, false),
                indented: 0,
                startOfLine: true,
                prevToken: null
            };
        },

        token: function(stream, state) {
            var ctx = state.context;
            if (stream.sol()) {
                if (ctx.align == null) ctx.align = false;
                state.indented = stream.indentation();
                state.startOfLine = true;
            }
            if (stream.eatSpace()) { maybeEOL(stream, state); return null; }
            curPunc = isDefKeyword = null;
            var style = (state.tokenize || tokenBase)(stream, state);
            if (style == "comment" || style == "meta") return style;
            if (ctx.align == null) ctx.align = true;

            if (curPunc == ";" || curPunc == ":" || (curPunc == "," && stream.match(/^\s*(?:\/\/.*)?$/, false)))
                while (state.context.type == "statement") popContext(state);
            else if (curPunc == "{") pushContext(state, stream.column(), "}");
            else if (curPunc == "[") pushContext(state, stream.column(), "]");
            else if (curPunc == "(") pushContext(state, stream.column(), ")");
            else if (curPunc == "}") {
                while (ctx.type == "statement") ctx = popContext(state);
                if (ctx.type == "}") ctx = popContext(state);
                while (ctx.type == "statement") ctx = popContext(state);
            }
            else if (curPunc == ctx.type) popContext(state);
            else if (indentStatements &&
                (((ctx.type == "}" || ctx.type == "top") && curPunc != ";") ||
                    (ctx.type == "statement" && curPunc == "newstatement"))) {
                pushContext(state, stream.column(), "statement", stream.current());
            }

            if (style == "variable" &&
                ((state.prevToken == "def" ||
                    (parserConfig.typeFirstDefinitions && typeBefore(stream, state, stream.start) &&
                        isTopScope(state.context) && stream.match(/^\s*\(/, false)))))
                style = "def";

            if (hooks.token) {
                var result = hooks.token(stream, state, style);
                if (result !== undefined) style = result;
            }

            if (style == "def" && parserConfig.styleDefs === false) style = "variable";

            state.startOfLine = false;
            state.prevToken = isDefKeyword ? "def" : style || curPunc;
            maybeEOL(stream, state);
            return style;
        },

        indent: function(state, textAfter, context) {
            if (state.tokenize != tokenBase && state.tokenize != null || state.typeAtEndOfLine) return null;
            var ctx = state.context, firstChar = textAfter && textAfter.charAt(0);
            var closing = firstChar == ctx.type;
            if (ctx.type == "statement" && firstChar == "}") ctx = ctx.prev;
            if (parserConfig.dontIndentStatements)
                while (ctx.type == "statement" && parserConfig.dontIndentStatements.test(ctx.info))
                    ctx = ctx.prev
            if (hooks.indent) {
                var hook = hooks.indent(state, ctx, textAfter, context.unit);
                if (typeof hook == "number") return hook
            }
            var switchBlock = ctx.prev && ctx.prev.info == "switch";
            if (parserConfig.allmanIndentation && /[{(]/.test(firstChar)) {
                while (ctx.type != "top" && ctx.type != "}") ctx = ctx.prev
                return ctx.indented
            }
            if (ctx.type == "statement")
                return ctx.indented + (firstChar == "{" ? 0 : statementIndentUnit || context.unit);
            if (ctx.align && (!dontAlignCalls || ctx.type != ")"))
                return ctx.column + (closing ? 0 : 1);
            if (ctx.type == ")" && !closing)
                return ctx.indented + (statementIndentUnit || context.unit);

            return ctx.indented + (closing ? 0 : context.unit) +
                (!closing && switchBlock && !/^(?:case|default)\b/.test(textAfter) ? context.unit : 0);
        },

        languageData: {
            indentOnInput: indentSwitch ? /^\s*(?:case .*?:|default:|\{\}?|\})$/ : /^\s*[{}]$/,
            commentTokens: {line: "//", block: {open: "/*", close: "*/"}},
            autocomplete: Object.keys(keywords).concat(Object.keys(types)).concat(Object.keys(builtin)).concat(Object.keys(atoms))
        }
    };
}

const glsl_snippets = [
    snippetCompletion("${type} ${name}(${params}) {\n\t${}\n}", {
        label: "function",
        detail: "definition",
        type: "keyword"
    }),
    snippetCompletion("for (int ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
        label: "for",
        detail: "loop",
        type: "keyword"
    }),
]

const lang = StreamLanguage.define(shaderLanguage());

const glsl = new LanguageSupport(lang, [
    lang.data.of({
        autocomplete: ifNotIn(["LineComment", "BlockComment", "String"], completeFromList(glsl_snippets))
    })
]);

// EXTERNAL MODULE: ./sys/public/js/editor/bottom.js
var bottom = __webpack_require__(275);
;// CONCATENATED MODULE: ./sys/public/js/editor/hover.js



const glslRef = {
    abs: {
        type: "buildin",
        desc: "return the absolute value of the parameter"
    },
    acos: {
        type: "buildin",
        desc: "return the arccosine of the parameter"
    },
    all: {
        type: "buildin",
        desc: "check whether all elements of a boolean vector are true"
    },
    sin: {
        type: "buildin",
        desc: "return the sine of the parameter"
    },
    gl_FragCoord: {
        type: "keyword",
        desc: "contains the window-relative coordinates of the current fragment"
    },
    gl_FragColor: {
        type: "keyword",
        desc: "contains the window-relative coordinates of the current fragment"
    }
}

const glslColor = {
    keyword: "#6478ac",
    buildin: "#2790d2"
}

const hoverTooltipTheme = editorview/* EditorView.baseTheme */.t.baseTheme({
    ".cm-tooltip.cm-tooltip-hover": {
        borderRadius: "2px",
        borderBottom: "1px solid var(--graph_icon)",
        backgroundColor: "var(--graph_bg_thin)",
        "& .cm-tooltip-section div": {
            fontSize: "14px",
        }
    }
})

const glslHoverRef = [ hoverTooltip((view, pos, side) => {
    let { from, to, text } = view.state.doc.lineAt(pos); // single line
    let start = pos, end = pos;
    while (start > from && /\w/.test(text[start - from - 1])) start--;
    while (end < to && /\w/.test(text[end - from])) end++;
    if (start === pos && side < 0 || end === pos && side > 0) return null;
    const target = text.slice(start - from, end - from);
    if (glslKeywords[target] || glslTypes[target] || glslParams[target]) return null;
    return {
        pos: start,
        end,
        above: true,
        create(view) {
            let ref, dom = document.createElement("div");
            if ((ref = glslRef[target])) {
                dom.innerHTML += `<div style='margin: 7px 10px 7px 10px; display: flex;'>
                                     <div style='color: ${glslColor[ref.type]};'>${ref.type} macro</div>
                                     <div style="margin-left: 5px; color: #6643bf">${target}</div>
                                  </div>`
                dom.innerHTML += `<div style="height: 1px; border-top: 1px solid var(--graph_icon); text-align: center;"></div>`;
                dom.innerHTML += `<div style="margin: 7px 10px 7px 10px; color: var(--text_mid_dark)">${ref.desc}</div>`;
            } else {
                dom.innerHTML += `<div style="margin: 5px 10px 5px 10px; color: #538035">ღ variable ${target}</div>`
            }
            return { dom };
        }
    }
}), hoverTooltipTheme ];

;// CONCATENATED MODULE: ./sys/public/js/editor/instance.js








let instances = {};

const glslInstance = (name, dom, override = null) => {
    if (instances[name]) return instances[name];
    instances[name] = new editorview/* EditorView */.t({
        state: dist_state/* EditorState.create */.yy.create({
            doc: override ? override : localStorage.getItem(name),
            extensions: [
                default_defaultConfig,
                editorview/* EditorView.lineWrapping */.t.lineWrapping, // css white-space
                glsl,
                bottom/* wordCounter */.Y,
                glslHoverRef,
                extension/* ViewPlugin.fromClass */.lg.fromClass(class {
                    constructor(view) { localStorage.setItem(name, view.state.doc); }
                    update(update) { if (update.docChanged) localStorage.setItem(name, update.state.doc); }
                    destroy() { delete instances[name]; }
                })
            ]
        }),
        parent: dom
    });
    return instances[name];
}

const javascriptInstance = (name, dom) => {
    if (instances[name]) return instances[name];
    instances[name] = new editorview/* EditorView */.t({
        state: dist_state/* EditorState.create */.yy.create({
            doc: localStorage.getItem(name) ||
                'function hello(who = "world") {\n' +
                '  console.log(`Hello, ${who}!`)\n' +
                '}',
            extensions: [
                default_defaultConfig,
                editorview/* EditorView.lineWrapping */.t.lineWrapping, // css white-space
                javascript(),
                bottom/* wordCounter */.Y,
                extension/* ViewPlugin.fromClass */.lg.fromClass(class {
                    constructor(view) { localStorage.setItem(name, view.state.doc); }
                    update(update) { if (update.docChanged) localStorage.setItem(name, update.state.doc); }
                    destroy() { delete instances[name] }
                })
            ]
        }),
        parent: dom
    });
    return instances[name];
}




;// CONCATENATED MODULE: ./sys/public/js/element/editor/flow/template.js
const template_base =
    (/* unused pure expression or super */ null && ('precision highp float;\n' +
    'attribute vec3 position;\n' +
    'attribute vec2 uv;\n' +
    'void main(void) {\n' +
    '  \n' +
    '}'))

const baseVs =
    'precision highp float;\n' +
    'attribute vec3 position;\n' +
    'attribute vec2 uv;\n' +
    'uniform mat4 worldViewProjection;\n' +
    'varying vec2 vUV;\n' +
    'void main(void) {\n' +
    '  gl_Position = worldViewProjection * vec4(position, 1.0);\n' +
    '  vUV = uv;\n' +
    '}'

const baseFs =
    'precision highp float;\n' +
    'varying vec2 vUV;\n' +
    'uniform sampler2D textureSampler;\n' +
    'void main(void) {\n' +
    '  gl_FragColor = texture2D(textureSampler, vUV);\n' +
    '}'

;// CONCATENATED MODULE: ./sys/public/js/element/editor/flow/structure.js
const flowElement = document.getElementById("workflow");
const heightLocate = (flowElement.clientHeight - 53) / 2;
const widthLocate = flowElement.clientWidth / 2;

let structure = {
    "drawflow": {
        "Home": {
            "data": {
                "1": {
                    "id": 1, "name": "vertex", "data": {}, "class": "vertex",
                    "html": `
                        <div>
                            <div class="title-box">
                                <img src="/img/editor/shader.svg" alt="">
                                Vertex shader
                            </div>
                        </div>
                    `,
                    "typenode": false,
                    "inputs": {
                        "input_1": { "connections": [] }
                    },
                    "outputs": {
                        "output_1": { "connections": [{ "node": "2", "output": "input_1" }] }
                    },
                    "pos_x": widthLocate - 18 - 160, "pos_y": heightLocate
                },
                "2": {
                    "id": 2, "name": "fragment", "data": {}, "class": "fragment",
                    "html": `
                        <div>
                            <div class="title-box">
                                <img src="/img/editor/shader.svg" alt="">
                                Fragment shader
                            </div>
                        </div>
                    `,
                    "typenode": false,
                    "inputs": {
                        "input_1": { "connections": [{ "node": "1", "input": "output_1" }] }
                    },
                    "outputs": {},
                    "pos_x": widthLocate + 18, "pos_y": heightLocate
                }
            }
        }
    }
};

;// CONCATENATED MODULE: ./sys/public/js/element/editor/flow/node.js
const vsNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/shader.svg" alt="">
            Vertex Shader
        </div>
    </div>
`;

const fsNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/shader.svg" alt="">
            Fragment Shader
        </div>
    </div>
`;

const imageNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/image.svg" alt="">
            Image
        </div>
        <div class="box">
            <input class="image" type="file" value="Select image">
        </div>
    </div>
`;

const meshNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/grid.svg" alt="">
            Mesh
        </div>
    </div>
`;

const timeNode = (/* unused pure expression or super */ null && (`
    
`));

const bufferNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/buffer.svg" alt="">
            RT handle
        </div>
        <div class="box">
            <p>RT name</p>
            <div class="buffer-container">
                <input class="buffer" type="text" df-name placeholder="buffer name">
            </div>
        </div>
    </div>
`;

const customNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/code.svg" alt="">
            <input class="custom" type="text" df-name placeholder="node name">
        </div>
    </div>
`;

;// CONCATENATED MODULE: ./sys/public/js/element/editor/flow/action.js



const holderElement = document.querySelector(".sl-editor .flow-holder");

const lockElement = document.querySelector(".sl-editor #workflow .workflow-lock .lock");
const unlockElement = document.querySelector(".sl-editor #workflow .workflow-lock .unlock");
const minusElement = document.querySelector(".sl-editor #workflow .workflow-zoom .minus");
const fitElement = document.querySelector(".sl-editor #workflow .workflow-zoom .fit");
const plusElement = document.querySelector(".sl-editor #workflow .workflow-zoom .plus");

let mobileItemSelec = '', mobileLastMove = null;

const addNodeToFlow = (name, posX, posY) => {
    if(editor.editor_mode == "fixed") return false;
    posX = posX * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
    posY = posY * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));
    switch (name) {
        case "vertex":
            editor.addNode("vertex", 1, 1, posX, posY, "vertex", {}, vsNode);
            break;
        case "fragment":
            editor.addNode("fragment", 1, 0, posX, posY, "fragment", {}, fsNode);
            break;
        case "image":
            editor.addNode("image", 0, 1, posX, posY, "image", {}, imageNode);
            break;
        case "mesh":
            editor.addNode("mesh", 0, 1, posX, posY, "mesh", {}, meshNode);
            break;
        case "buffer":
            editor.addNode("buffer", 0, 1, posX, posY, "buffer", { name: name }, bufferNode);
            break;
        default:
            if (prefabs[name])
                editor.addNode(name, 0, 1, posX, posY, "custom", { name: name }, customNode);
            break;
    }
};

const changeMode = option => {
    if(option == "lock") {
        lockElement.style.display = "none";
        unlockElement.style.display = "block";
    } else {
        lockElement.style.display = "block";
        unlockElement.style.display = "none";
    }
};

const drag = event => {
    if (event.type == "touchstart") {
        mobileItemSelec = event.target.closest(".flow-drag").getAttribute("data-node");
    } else {
        event.dataTransfer.setData("node", event.target.getAttribute("data-node"));
    }
};

const drop = event => {
    if (event.type == "touchend") {
        let parent = document.elementFromPoint(mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY).closest("#workflow");
        if (parent != null)
            addNodeToFlow(mobileItemSelec, mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY);
        mobileItemSelec = '';
    } else {
        event.preventDefault();
        let data = event.dataTransfer.getData("node");
        addNodeToFlow(data, event.clientX, event.clientY);
    }
};

const linkEventListener = () => {
    editor.zoom_reset(0.8);
    lockElement.addEventListener("click", () => {
        editor.editor_mode = "fixed";
        changeMode("lock");
    });
    unlockElement.addEventListener("click", () => {
        editor.editor_mode = "edit";
        changeMode("unlock");
    });
    minusElement.addEventListener("click", () => editor.zoom_out());
    fitElement.addEventListener("click", () => editor.zoom_reset());
    plusElement.addEventListener("click", () => editor.zoom_in());
};

const bindEventListener = node => {
    node.addEventListener("dragstart", drag);
    node.addEventListener("touchstart", drag, false);
    node.addEventListener("touchend", drop, false);
    node.addEventListener("touchmove", event => mobileLastMove = event, false);
    holderElement.append(node);
};

;// CONCATENATED MODULE: ./sys/public/js/element/editor/flow.js






const workflowElement = document.getElementById("workflow");
const createElement = document.querySelector(".sl-editor .flow-create");
const panelElement = document.querySelector(".sl-editor #panel");

let prefabs = {};
let prefabLinks = {}, tempId = -1;

const editor = new Drawflow(workflowElement);
editor.start();
editor.import(structure);

const prefab = (node, info) => {
    let data = document.createElement("div");
    data.setAttribute("class", "flow-drag");
    data.setAttribute("draggable", true);
    data.setAttribute("data-node", node);
    data.innerHTML = info;
    return data;
};

/**
 * Create a node
 * @param id id of the node create
 */
const nodeCreate = id => {
    if (tempId > 0) document.getElementById(`code_${tempId}`).style.display = "none";
    let target = document.createElement("div");
    target.id = `code_${id}`;
    panelElement.append(target);
    structure.drawflow.Home.data[id] = editor.getNodeFromId(id).name;
    console.log("Node Create ", tempId, id, editor.getNodeFromId(id), structure.drawflow.Home.data);
    switch (structure.drawflow.Home.data[id]) {
        case "vertex":
            glslInstance(`code_${id}`, target, baseVs);
            break;
        case "fragment":
            glslInstance(`code_${id}`, target, baseFs);
            break;
        default:
            if (editor.getNodeFromId(id).name.includes("custom"))
                javascriptInstance(`code_${id}`, target);
            break;
    }
    tempId = id;
}

const flowFeature = () => {
    linkEventListener();

    editor.on("nodeCreated", nodeCreate);

    editor.on("nodeSelected", function(id) {
        console.log("select", tempId, id, editor.getNodeFromId(id));
        if (tempId == id) return;
        let target = document.getElementById(`code_${id}`);
        if (target) {
            if (tempId > 0) document.getElementById(`code_${tempId}`).style.display = "none";
            target.style.display = "block";
            tempId = id;
        } else {
            if (tempId > 0) document.getElementById(`code_${tempId}`).style.display = "none";
            target = document.createElement("div");
            target.id = `code_${id}`;
            panelElement.append(target);
            tempId = id;
        }
    })

    editor.on("nodeRemoved", function(id) {
        delete structure.drawflow.Home.data[id];
        localStorage.removeItem(`code_${id}`);
        instances[`code_${id}`].destroy();
        document.getElementById(`code_${tempId}`).remove();
        tempId = -1;
    });

    nodeCreate(1); nodeCreate(2);

    workflowElement.addEventListener("drop", drop);
    workflowElement.addEventListener("dragover", event => event.preventDefault());

    prefabs["vertex"] = prefab("vertex", `<img src="/img/editor/shader.svg" alt=""><span>VS</span>`);
    bindEventListener(prefabs["vertex"]);
    prefabs["fragment"] = prefab("fragment", `<img src="/img/editor/shader.svg" alt=""><span>FS</span>`);
    bindEventListener(prefabs["fragment"]);
    prefabs["image"] = prefab("image", `<img src="/img/editor/image.svg" alt=""><span>Image</span>`);
    bindEventListener(prefabs["image"]);
    prefabs["mesh"] = prefab("mesh", `<img src="/img/editor/grid.svg" alt=""><span>Mesh</span>`);
    bindEventListener(prefabs["mesh"]);
    prefabs["buffer"] = prefab("buffer", `<img src="/img/editor/buffer.svg" alt=""><span>Buffer</span>`)
    bindEventListener(prefabs["buffer"]);

    createElement.addEventListener("click", () => {
        const index = (Object.keys(prefabs).length - 4);
        const name = "custom" + index;
        prefabs[name] = prefab(name, `<img src="/img/editor/code.svg" alt=""><span>Node ${index}</span>`);
        bindEventListener(prefabs[name]);
        console.log(prefabs);
    });
}





/***/ })

}]);