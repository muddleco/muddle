<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import Icon from '@iconify/svelte';
	import hotkeys from 'hotkeys-js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';

	onMount(() => {
		hotkeys('enter', () => {
			console.log('hurray');
		});
	});
</script>

<svelte:head>
	<title>New message | Muddle</title>
</svelte:head>
<Navbar
	items={[
		{ title: 'Everything', link: '/' },
		{ title: 'Important', link: '/important' },
		{ title: 'Team', link: '/team' }
	]}
/>
<div class="flex h-screen pt-12">
	<div class="w-3/4 pt-4 px-5">
		<form
			method="POST"
			use:enhance={() => {
				return async () => {
					goto('/');
				};
			}}
		>
			<input
				name="subject"
				type="text"
				placeholder="Subject"
				autocomplete="off"
				class="block outline-none font-medium text-xl w-full mb-2"
			/>
			<span class="text-gray-400 mr-4">To:</span><input
				name="to"
				type="text"
				autocomplete="off"
				class="outline-none mb-8"
			/>
			<textarea
				name="message"
				placeholder="Say something interesting..."
				autocomplete="off"
				class="block w-full h-64 outline-none"
			/>
			<Button text="Send" type="primary" submit={true} />
			<Button text="Send Later" type="secondary" />
            <!-- TODO: Implement Send Later -->
		</form>
	</div>
	<div class="w-1/4 bg-gray-50 border-l border-gray-200 p-5">Hello</div>
    <!-- TODO: Add sidebar content, possibly user info for yourself, like Superhuman does -->
</div>
