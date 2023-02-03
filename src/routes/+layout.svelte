<script>
	import '../app.postcss';
	import "@fontsource/lexend/variable.css";
	import "@fontsource/inter/variable.css";
</script>

<slot />

<style>
	:global(body) {
		font-family: 'InterVariable', sans-serif;
	}
	
	:global(h1, h2, h3, .font-lexend) {
		font-family: 'LexendVariable', sans-serif;
	}
</style>