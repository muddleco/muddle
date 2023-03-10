<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Messages from './Messages.svelte';
	import Icon from '@iconify/svelte';
	import Message from './Message.svelte';
	import hotkeys from 'hotkeys-js';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import extractDomainFromEmail from '$lib/utils/domain-parser';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);

	// Search
	let query = '';
	let results: any = [];

	const handleSearch = () => {
		fetch(`http://localhost:5173/api/search?query=${query}`)
			.then((response) => response.json())
			.then((data) => {
				results = data.messages.filter(
					(message: any) => message.labels && message.labels.includes('INBOX')
				);
			});
	};

	const handleInput = (event: any) => {
		query = event.target.value;
	};

	// Setup functions
	const token = async () => {
		const res = await fetch('http://localhost:5173/api/token', { method: 'POST' });
		const json = await res.json();
		console.log(json);
	};

	const incrementalSync = async () => {
		const res = await fetch('http://localhost:5173/api/sync?type=incremental', { method: 'POST' });
		const json = await res.json();
		console.log(json);
	};

	const fullSync = async () => {
		const res = await fetch('http://localhost:5173/api/sync?type=full', { method: 'POST' });
		const json = await res.json();
		console.log(json);
	};

	const authorize = async () => {
		const res = await fetch('http://localhost:5173/api/gmail', { method: 'POST' });
		const json = await res.json();
		console.log(json.url);
	};

	let messages = [
		{
			id: '1867af4927be0817',
			historyId: '00000',
			user: 1,
			date: 'Wed, 22 Feb 2023 15:08:12 -0600',
			from: 'Muddle <hello@muddle.co>',
			labels: ['INBOX'],
			subject: 'Loading...',
			snippet: 'Loading...',
			body: 'Hello'
		}
	];

	const update = async () => {
		const res = await fetch('http://localhost:5173/api/messages');
		const json = await res.json();

		// Filter messages in the inbox
		messages = json.messages.filter(
			(message: any) => message.labels && message.labels.includes('INBOX')
		);
	};

	let hoverMessage = messages[-0];
	let showMessage = false;
	let selectedMessage: any = null;

	onMount(() => {
		update();

		// Setup hotkeys
		hotkeys('enter', () => {
			if (!selectedMessage) {
				showMessage = true;
				selectedMessage = messages[0];
			}
		});
	});
</script>

<svelte:head>
	<title>{showMessage ? selectedMessage?.subject : 'Inbox'} | Muddle</title>
</svelte:head>
<Navbar
	items={[
		{ title: 'Everything', link: '/' },
		{ title: 'Important', link: '?important' },
		{ title: 'Team', link: '/team' }
	]}
	{query}
	{handleInput}
	{handleSearch}
/>
<div class="flex h-screen pt-12">
	<div class="w-3/4 pt-4 overflow-y-scroll">
		{#if showMessage}
			<Message {messages} {update} bind:showMessage bind:message={selectedMessage} bind:selectedMessage />
		{:else if results.length > 0}
			<Messages bind:messages={results} bind:showMessage bind:hoverMessage bind:selectedMessage />
		{:else}
			<Messages {messages} bind:showMessage bind:hoverMessage bind:selectedMessage />
		{/if}
	</div>
	<div class="w-1/4 bg-gray-50 border-l border-gray-200 p-5">
		<div class="flex">
			<div class="bg-pink-200 w-11 h-11 rounded-full mr-3" />
			<div class="-mt-0.5">
				{#if hoverMessage.from.includes('<')}
					<h2 class="text-xl text-gray-800">
						{hoverMessage.from.split('<')[0].replaceAll('"', '')}
					</h2>
				{:else}
					<h2 class="text-xl text-gray-800">{hoverMessage.from.split('@')[0]}</h2>
				{/if}
				{#if hoverMessage.from.includes('<')}
					<p class="text-gray-500 text-xs">
						{hoverMessage.from.split('<')[1].replace('>', '')}
					</p>
				{:else}
					<p class="text-gray-500 text-xs">{hoverMessage.from}</p>
				{/if}
			</div>
		</div>
		<div class="mt-4 rounded-sm bg-blue-50 border border-blue-200 p-2">
			<div class="flex">
				<div class="flex-shrink-0">
					<Icon icon="tabler:info-circle" class="h-5 w-5 text-blue-400" />
				</div>
				<p class="ml-2 text-sm text-blue-500">Follow up scheduled in 2 days</p>
			</div>
		</div>
		<div class="mt-8">
			<div class="flex mb-2">
				<Icon icon="tabler:mail" class="h-4 w-4 text-gray-400 mr-2" />
				<span class="text-sm text-gray-700 -mt-0.5">Recent conversations</span>
			</div>
			<div class="text-gray-400 text-xs space-y-2">
				{#each messages as message}
					{#if message.from === hoverMessage.from && message.id !== hoverMessage.id}
						<div class="flex">
							<span class="w-3/4">{message.subject}</span>
							<span class="w-1/4 text-right text-gray-300 text-xs">
								{dayjs(message.date).fromNow()}
							</span>
						</div>
					{/if}
				{/each}
			</div>
		</div>
		<div class="mt-8">
			<div class="flex mb-2">
				<Icon icon="tabler:calendar" class="h-4 w-4 text-gray-400 mr-2" />
				<span class="text-sm text-gray-700 -mt-0.5">Upcoming events</span>
			</div>
			<div class="text-gray-400 text-xs space-y-2">
				<div class="flex">
					<span class="w-3/4">Daily standup</span>
					<span class="w-1/4 text-right text-gray-300 text-xs">in 4 hours</span>
				</div>
				<div class="flex">
					<span class="w-3/4">Product strategy</span>
					<span class="w-1/4 text-right text-gray-300 text-xs">in 3 days</span>
				</div>
				<div class="flex">
					<span class="w-3/4">Hiring call with John B</span>
					<span class="w-1/4 text-right text-gray-300 text-xs">in 2 weeks</span>
				</div>
			</div>
		</div>
		<div class="mt-8">
			{#if hoverMessage.from.split('<')[1] && extractDomainFromEmail(hoverMessage.from
						.split('<')[1]
						.replace('>', ''))}
				<div class="flex">
					<Icon icon="tabler:link" class="h-4 w-4 text-gray-400 mr-2" />
					<span class="text-sm text-gray-700 -mt-0.5"
						>{extractDomainFromEmail(hoverMessage.from.split('<')[1].replace('>', ''))}</span
					>
				</div>
			{/if}
		</div>
		<div class="absolute bottom-5 space-y-2">
			<button on:click={() => {update();}}>Update</button>
			<button on:click={() => {incrementalSync();}}>Incremental Sync</button>
			<button on:click={() => {fullSync();}}>Full Sync</button>
			{#each messages as message}
				{#if message.labels.includes('STARRED')}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<div
						class="bg-white rounded-sm border border-gray-200 text-gray-500 text-sm px-4 py-2 flex"
						on:mouseover={() => (hoverMessage = message)}
						on:click={() => {
							selectedMessage = message;
							showMessage = true;
						}}
					>
						<Icon icon="tabler:star" class="h-4 w-4 text-yellow-400 mr-4 mt-0.5" />{message.subject}
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.overflow-y-scroll::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.overflow-y-scroll {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
