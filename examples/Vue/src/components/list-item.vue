<style lang="scss">
.list-item {
	background-color: green;
	min-height: 100px;
	margin: 15px;
	width: 100%;
}
    
</style>

<template>
    <div class="list-item">
        <span>{{ name }}</span>
    </div>
</template>

<script>
module.exports = {
    
    props: {
    	name: "Hello"
    },
    
    ready: function() {
    
	},
    
    methods: {
        randoizeName: function() {
            this.name = Math.random();
        }

	}	
}

</script>
