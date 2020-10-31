<template>
	<li class="nav-item mr-2 mb-2">
		<a
			v-bind:class="[
				list.isActive ? 'active' : 'bg-secondary',
				'nav-link fs-sm',
			]"
			@click="$emit('switchtab')"
			style="padding: 3px 10px"
			data-toggle="tab"
			v-bind:href="'#list' + list.id"
		>
			<div
				v-if="list.isBusy"
				class="spinner-border spinner-border-sm"
				style="margin: 0 4px 1px 0"
			></div>

			<button
				v-if="!list.isBusy"
				@click="saveListAsFile(list)"
				class="btn btn-sm p-0 mr-1"
			>
				<i class="fa fa-download"></i>
			</button>

			<button @click="setNewName(list)" class="btn btn-sm p-0 mr-1">
				<i class="fa fa-pencil"></i>
			</button>

			{{ list.name }}

			<button
				v-if="!list.isBusy"
				@click="deleteList(list.id)"
				type="button"
				class="close"
				style="line-height: 100%; margin-left: 6px"
			>
				<span aria-hidden="true" class="mb-2">&times;</span>
			</button>
		</a>
	</li>
</template>

<script>
export default {
	props: ["list", "lists"],
	template: "#list-pill-component",
	methods: {
		setNewName(list) {
			let newName = prompt("Переименовать", list.name);
			if (newName && newName.trim()) {
				list.name = newName.trim();
			}
		},
		saveListAsFile(list) {
			const a = document.createElement("a");
			a.href = URL.createObjectURL(
				new Blob([JSON.stringify(list)], {
					type: "text/plain",
				})
			);
			a.setAttribute("download", `${list.name}.txt`);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		},
		deleteList(id) {
			const listIndex = this.lists.findIndex((list) => list.id === id);
			this.lists.splice(listIndex, 1);
		},
	},
};
</script>

<style>
</style>