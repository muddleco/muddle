<script lang="ts">
	import Icon from '@iconify/svelte';
	export let items: Array<{ title: string; link: string }> = [];
	export let query: any;
	export let handleInput: any;
	export let handleSearch: any;
</script>

<header
	class="bg-gray-50 border-b border-gray-200 absolute w-full top-0 z-50 bg-opacity-75 backdrop-blur-sm"
>
	<nav class="mx-6" aria-label="Top">
		<div
			class="flex w-full items-center justify-between border-b border-gray-500 py-2 lg:border-none"
		>
			<div class="flex items-center">
				<a href="/" class="pt-1">
					<img class="h-6" src="logo.svg" alt="Muddle Logo" />
				</a>
				<div class="ml-6 hidden space-x-5 lg:block">
					{#each items as item}
						<a href={item.link} class="text-sm font-medium text-gray-600 hover:text-gray-800"
							>{item.title}</a
						>
					{/each}
				</div>
			</div>
			<div class="ml-10 space-x-4 flex">
				<div class="flex">
					<form on:submit={(e) => { e.preventDefault(); handleSearch();}}>
						<input
							class="bg-gray-50 border-b border-gray-200 focus:outline-none focus:border-gray-400 mr-2 text-sm"
							type="text"
							bind:value={query}
							on:input={handleInput}
							placeholder="Search for anything"
						/>
						<button class="mt-1.5" on:click={handleSearch}
							><Icon icon="tabler:search" class="h-4 w-4 text-gray-600" /></button
						>
					</form>
				</div>
				<a href="/new">
					<Icon icon="tabler:pencil" class="h-4 w-4 mt-1.5 text-gray-600" />
				</a>
				<a href="/">
					<Icon icon="tabler:user" class="h-4 w-4 mt-1.5 text-gray-600" />
				</a>
			</div>
		</div>
		<div class="flex flex-wrap justify-center gap-x-6 py-4 lg:hidden">
			{#each items as item}
				<a href={item.link} class="text-base font-medium text-white hover:text-gray-50">
					{item.title}
				</a>
			{/each}
		</div>
	</nav>
</header>
