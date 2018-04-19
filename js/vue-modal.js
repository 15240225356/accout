var compModal = {
	template:"\
		<div class='modal-mask' v-show='v_show' transition='modal'>\
			<div class='modal-wrapper'>\
				<div class='modal-container'>\
					<div class='modal-header'>\
						<slot name='header'></slot>\
					</div>\
					<div class='modal-body'>\
						<slot name='body'></slot>\
					</div>\
					<div class='modal-footer'>\
						<slot name='footer'>\
							<button class='modal-default-button' v-on:click='_f_modal_close'>OK</button>\
						</slot>\
					</div>\
				</div>\
			</div>\
		</div>",
	props: {
		v_show: {
			type: Boolean,	// type支持String|Number|Boolean|Function|Object|Array	
			required: true, // 必需且是bool类型的
			default: false
		},
		v_option: {
			type: Object,
			required: false
		}
	},
	methods: {
		_f_modal_close: function() {
			this.$emit('f_close');
		}
	}
};
