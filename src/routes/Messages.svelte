<script lang="ts">
	import { slide } from 'svelte/transition';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);

	export let messages: any;
	export let hoverMessage;
	export let showMessage;
	export let selectedMessage;
</script>

<div transition:slide>
	{#each messages as message}
		{#if !message.labels.includes('STARRED')}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
			<div
				class="group hover:bg-gray-50 px-5 py-2 text-xs flex"
				on:mouseover={() => (hoverMessage = message)}
				on:click={() => {
					selectedMessage = message;
					showMessage = true;
				}}
			>
				{#if message.from.includes('<')}
					{#if message.labels.includes('UNREAD')}
						<div class="w-1.5 h-1.5 mt-1 -ml-3 mr-2 rounded-full bg-pink-500"></div>
					{/if}
					<span class="font-medium w-2/12">{message.from.split('<')[0].replaceAll("\"", "")}</span>
				{:else}
					<span class="font-medium w-2/12">{message.from.split('@')[0]}</span>
				{/if}
				<div class="w-9/12 whitespace-nowrap overflow-hidden overflow-ellipsis">
					<span>{message.subject}</span>
					<span class="ml-2 text-gray-500">{message.snippet}</span>
				</div>
				<div class="w-1/12 text-right text-gray-300">
					<div class="hidden group-hover:block">Actions</div>
					<span class="group-hover:hidden">{dayjs(message.date).fromNow()}</span>
				</div>
			</div>
		{/if}
	{/each}
</div>
