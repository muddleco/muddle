<script lang="ts">
    export let text: string;
    export let type = "";
    export let size = "";
    export let submit = false;
    export let onClick = () => {};
    let classNames = "inline-flex items-center rounded-sm border border-transparent font-lexend font-medium leading-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

    if (!size) {
        classNames += " px-4 py-2 text-sm";
    } else if (size == "sm") {
        classNames += " px-3.5 py-2 text-sm";
    } else if (size == "lg") {
        classNames += " px-5 py-2 text-base";
    }

    if (!type || type == "primary") {
        classNames += " bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500";
    } else if (type == "secondary") {
        classNames += " bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-200 focus:ring-gray-500";
    } else if (type == "white") {
        classNames += " bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500";
    }
</script>

<button class={classNames} on:click={onClick} type={submit ? "submit" : "button"}>{text}</button>