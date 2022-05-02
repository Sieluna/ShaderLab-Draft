export class Arrow {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.tmpX1 = null;
        this.tmpY1 = null;
        this.tmpX2 = null;
        this.tmpY2 = null;
        this.color = "black";
    }

    setColor(color) {
        this.color = color;
    }

    setP(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    /**
     * Set the first corner point
     * @param {number} tmpX1
     * @param {number} tmpY1
     */
    setP1(tmpX1,tmpY1) {
        this.tmpX1=tmpX1;
        this.tmpY1=tmpY1;
    }

    /**
     * Set the second corner point
     * @param {number} tmpX2
     * @param {number} tmpY2
     */
    setP2(tmpX2,tmpY2) {
        this.tmpX2=tmpX2;
        this.tmpY2=tmpY2;
    }

    drawBottomToTop(ctx) {
        if (this.x1 != this.x2) {
            this.setP1(this.x1,(this.y1+this.y2)/2);
            this.setP2(this.x2,(this.y1+this.y2)/2);
            this.draw(ctx);
        }else{
            this.draw(ctx);
        }
    }

    drawLeftOrRightToTop(ctx) {
        this.setP1(this.x2,this.y1);
        this.draw(ctx);
    }


    drawLeftToRightOrRightToLeft(ctx) {
        if (this.y1 != this.y2) {
            this.setP1((this.x1+this.x2)/2,this.y1);
            this.setP2((this.x1+this.x2)/2,this.y2);
            this.draw(ctx);
        }else{
            this.draw(ctx);
        }
    }

    draw(ctx) {
        // arbitrary styling
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        // draw the line
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        if (this.tmpX1 != null && this.tmpY1 != null && this.tmpX2 != null && this.tmpY2 != null) {
            ctx.lineTo(this.tmpX1, this.tmpY1);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.tmpX1, this.tmpY1)
            ctx.lineTo(this.tmpX2, this.tmpY2);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.tmpX2, this.tmpY2);
            ctx.lineTo(this.x2, this.y2);
            ctx.closePath();
            ctx.stroke();
            let endRadians = Math.atan((this.y2 - this.tmpY2) / (this.x2 - this.tmpX2));
            endRadians += ((this.x2 >= this.tmpX2) ? 90 : -90) * Math.PI / 180;
            this.drawArrowhead(ctx, this.x2, this.y2, endRadians);
        } else if (this.tmpX1 != null && this.tmpY1 != null && this.tmpX2 == null && this.tmpY2 == null) {
            ctx.lineTo(this.tmpX1, this.tmpY1);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.tmpX1, this.tmpY1)
            ctx.lineTo(this.x2, this.y2);
            ctx.closePath();
            ctx.stroke();
            let endRadians = Math.atan((this.y2 - this.tmpY1) / (this.x2 - this.tmpX1));
            endRadians += ((this.x2 >= this.tmpX1) ? 90 : -90) * Math.PI / 180;
            this.drawArrowhead(ctx, this.x2, this.y2, endRadians);
        } else if (this.tmpX1 == null && this.tmpY1 == null && this.tmpX2 == null && this.tmpY2 == null) {
            ctx.lineTo(this.x2, this.y2);
            ctx.closePath();
            ctx.stroke();
            let endRadians = Math.atan((this.y2 - this.y1) / (this.x2 - this.x1));
            endRadians += ((this.x2 >= this.x1) ? 90 : -90) * Math.PI / 180;
            this.drawArrowhead(ctx, this.x2, this.y2, endRadians);
        }
    }

    /**
     * Draw the arrow head
     * @param ctx
     * @param x
     * @param y
     * @param radians
     */
    drawArrowhead(ctx, x, y, radians) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(radians);
        ctx.moveTo(0, 0);
        ctx.lineTo(5, 10);
        ctx.lineTo(-5, 10);
        ctx.closePath();
        ctx.restore();
        ctx.fill();
    }
}
