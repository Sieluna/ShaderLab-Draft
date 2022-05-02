import { Arrow } from "./arrow.js";

function drawRoundRect(ctx, x, y, w, h) {
    let r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.stroke();
}

function drawRhombus(ctx, x, y, l) {
    ctx.beginPath();
    ctx.moveTo(x, y + l);
    ctx.lineTo(x - l * 2, y);
    ctx.lineTo(x, y - l);
    ctx.lineTo(x + l * 2, y);
    ctx.closePath();
    ctx.stroke();
}

// TODO: abstract the base class of shape

export class Start {
    constructor(ctx, x, y, scale = 1) {
        this.ctx = ctx;
        this.h = 50 * scale;
        this.w = 2 * this.h;
        this.x = x;
        this.y = y;
        drawRoundRect(ctx, x - this.w / 2, y - this.h / 2, this.w, this.h);
    }

    drawBottomToTop(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x, this.y + this.h / 2, obj.x, obj.y - obj.h / 2);
            arrow.drawBottomToTop(this.ctx);
        } else if(obj.flag == "condition") {
            let arrow = new Arrow(this.x, this.y + this.h / 2, obj.x, obj.y - obj.l);
            arrow.drawBottomToTop(this.ctx);
        }
    }
}

export class Step {
    constructor(ctx, x, y, scale = 1) {
        this.ctx = ctx;
        this.flag = "step";
        this.h = 50 * scale;
        this.w = 2 * this.h;
        this.x = x;
        this.y = y;
        ctx.strokeRect(x - this.w / 2, y - this.h / 2, this.w, this.h);
    }

    drawBottomToTop(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x, this.y + this.h / 2, obj.x, obj.y - obj.h / 2);
            arrow.drawBottomToTop(this.ctx);
        } else if(obj.flag == "condition") {
            let arrow = new Arrow(this.x, this.y + this.h / 2, obj.x, obj.y - obj.l);
            arrow.drawBottomToTop(this.ctx);
        }
    }

    drawLeftToRight(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x + this.h, this.y, obj.x - this.w / 2, obj.y);
            arrow.drawLeftToRightOrRightToLeft(this.ctx);
        }
    }
}

export class Condition {
    constructor(ctx, x, y, scale = 1) {
        this.ctx = ctx;
        this.flag = "condition";
        this.l = 30 * scale;
        this.x = x;
        this.y = y;
        drawRhombus(ctx, x, y, this.l);
    }

    drawBottomToTop(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x, this.y + this.l, obj.x, obj.y - obj.h / 2);
            arrow.drawBottomToTop(this.ctx);
        } else if(obj.flag == "condition") {
            let arrow = new Arrow(this.x, this.y + this.l, obj.x, obj.y - obj.l);
            arrow.drawBottomToTop(this.ctx);
        }
    }

    drawRightToTop(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x + this.l * 2, this.y, obj.x, obj.y - obj.h / 2);
            arrow.drawLeftOrRightToTop(this.ctx);
        } else if(obj.flag == "condition") {
            let arrow = new Arrow(this.x + this.l * 2, this.y, obj.x, obj.y - obj.l);
            arrow.drawLeftOrRightToTop(this.ctx);
        }
    }

    drawLeftToTop(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x - this.l * 2, this.y, obj.x, obj.y - obj.h / 2);
            arrow.drawLeftOrRightToTop(this.ctx);
        } else if(obj.flag == "condition") {
            let arrow = new Arrow(this.x - this.l * 2, this.y, obj.x, obj.y - obj.l);
            arrow.drawLeftOrRightToTop(this.ctx);
        }
    }

    drawRightToLeft(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x + this.l * 2, this.y, obj.x - this.w / 2, obj.y);
            arrow.drawLeftToRightOrRightToLeft(this.ctx);
        } else if(obj.flag == "condition") {
            let arrow = new Arrow(this.x + this.l * 2, this.y, obj.x - this.l * 2, obj.y);
            arrow.drawLeftToRightOrRightToLeft(this.ctx);
        }
    }

    drawLeftToRight(obj) {
        if(obj.flag == "step") {
            let arrow = new Arrow(this.x - this.l * 2, this.y, obj.x + this.w / 2, obj.y);
            arrow.drawLeftToRightOrRightToLeft(this.ctx);
        } else if(obj.flag == "condition") {
            let arrow = new Arrow(this.x - this.l * 2, this.y, obj.x + this.l * 2, obj.y);
            arrow.drawLeftToRightOrRightToLeft(this.ctx);
        }
    }
}

