<script lang="ts">
	import Button from '$lib/Button.svelte';
	export let items: Array<{ title: string; link: string }> = [];
</script>

<header
	class="bg-gray-50 border-b border-gray-200 absolute w-full top-0 z-50 bg-opacity-75 backdrop-blur-sm"
>
	<nav class="mx-6" aria-label="Top">
		<div
			class="flex w-full items-center justify-between border-b border-gray-500 py-2 lg:border-none"
		>
			<div class="flex items-center">
				<a href="#" class="pt-0.5">
					<span class="font-lexend text-gray-700 text-xl">muddle</span>
				</a>
				<div class="ml-6 hidden space-x-5 lg:block">
					{#each items as item}
						<a href={item.link} class="text-sm font-medium text-gray-600 hover:text-gray-800"
							>{item.title}</a
						>
					{/each}
				</div>
			</div>
			<div class="ml-10 space-x-2">
				<Button text="Bailey Pumfleet" type="secondary" size="sm" />
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
