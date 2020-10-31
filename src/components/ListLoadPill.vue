<template>
	<li class="list-load-pill nav-link bg-success mr-2 mb-2">
		<input
			id="load-list"
			class="list-load-pill__input"
			type="file"
			accept=".txt"
		/>
		<label class="list-load-pill__icon" for="load-list">
			<i class="fa fa-upload"></i>
		</label>
	</li>
</template>

<script>
export default {
	mounted() {
		document.getElementById("load-list").onchange = (evt) => {
			if (!window.FileReader) return; // Browser is not compatible
			const reader = new FileReader();

			reader.onload = (evt) => {
				if (evt.target.readyState != 2) return;
				if (evt.target.error) {
					alert("Ошибка при чтении файла");
					return;
				}

				this.$emit("load", evt.target.result);
				// console.log("Содержимое файла", evt.target.result);
			};

			reader.readAsText(evt.target.files[0]);
		};
	},
};
</script>

<style lang="scss">
.list-load-pill {
	padding: 0;
	width: 30px;
	height: 30px;
	overflow: hidden;
	position: relative;

	&__input {
		opacity: 0;
		z-index: -1;
	}

	&__icon {
		cursor: pointer;
		position: absolute;
		width: 30px;
		height: 30px;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;

		i {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}
}
</style>

