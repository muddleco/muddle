<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Icon from '@iconify/svelte';
	export let messages: any;
	export let message: any;
	export let showMessage = false;
	export let selectedMessage: any;
	import { slide } from 'svelte/transition';
	import hotkeys from 'hotkeys-js';
	import { onMount } from 'svelte';
	import { createEditor } from 'svelte-editorjs';
	import Header from '@editorjs/header';
	import List from '@editorjs/list';

	let toggleReply = false;

	const { editor, data, isReady } = createEditor({
		autofocus: true,
		tools: { header: Header, list: List }
	});

	onMount(() => {
		// TODO: Make it stop at the end of the array
		hotkeys('k', () => {
			selectedMessage = messages[messages.indexOf(selectedMessage) - (1 % messages.length)];
		}); // up
		hotkeys('j', () => {
			selectedMessage = messages[messages.indexOf(selectedMessage) + (1 % messages.length)];
		}); // down
		hotkeys('esc', () => {showMessage = false; selectedMessage = null}); // close
		hotkeys('enter', () => (toggleReply = true)); // reply
		hotkeys('e', () => archiveMessage()); // archive
	});

	const archiveMessage = async () => {
		const res = await fetch('http://localhost:5173/api/archive?message=' + selectedMessage.id, {
			method: 'POST'
		});
		const json = await res.json();
		if (json.message === 'Success') {
			showMessage = false;
		}
	};

	const starMessage = async () => {
		const res = await fetch('http://localhost:5173/api/star?message=' + selectedMessage.id, {
			method: 'POST'
		});
		const json = await res.json();
		if (json.message === 'Success') {
			showMessage = false;
		}
	};
</script>

<div class="relative py-2" transition:slide>
	<div class="flex px-5 mb-5">
		<div class="flex w-3/4">
			<button on:click={() => {showMessage = false; selectedMessage = null;}} class="mr-2">
				<Icon icon="tabler:arrow-left" class="h-5 w-5 text-gray-400" />
			</button>
			<h1 class="text-2xl font-gray-800">{message.headers.subject}</h1>
		</div>
		<div class="w-1/4 space-x-2 flex justify-end">
			<Button text="Reply" type="secondary" onClick={() => toggleReply = true} />
			<Button text="Later" type="secondary" onClick={starMessage} />
			<Button text="Done" onClick={archiveMessage} />
		</div>
	</div>
	{#if message.textHtml}
		<div>{@html message.textHtml}</div>
	{:else}
		<p class="text-gray-500 mt-4 mx-5">{message.textPlain}</p>
	{/if}
	{#if toggleReply === true}
		<div class="mt-4 border border-gray-200 rounded-sm mx-5 w-3/4" use:editor />
	{/if}
</div>
