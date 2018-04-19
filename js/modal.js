var compModal = {
    template:"<div class='popwin-wrap' :class='{'smallAlert':data.smallAlert}'><div class='cont-wrap'><p class='title' v-if='data.title'>{{data.title}}</p><p class='msg' v-if='data.msg' v-html='data.msg'></p><ul class='btns'><li class='close' v-if='data.closeBtn' @click='close'>{{data.closeBtn}}</li><li class='confirm' v-if='data.confirmBtn' @click='confirm'>{{data.confirmBtn}}</li></ul></div></div>",
    props : ['data'],
    methods: {
        //左边按钮
        close: function() {
            this.$emit('close-modal');
        },
        //右边按钮 做具体的事情 比如 立刻还款
        confirm: function() {
            this.$emit('do-something');
        }
    }
};