<script>
	console.log('Hello, I am a spin loader!');
</script>

<span class="loader !bg-gradient-to-tr from-amber-600 to-amber-400" />

<style>
	/*Loader spiner 3*/
	.loader {
		width: 100px;
		height: 100px;
		display: inline-block;
		position: relative;
		transform: rotate(45deg);
	}
	.loader::before {
		content: '';
		box-sizing: border-box;
		width: 50px;
		height: 50px;
		position: absolute;
		left: 0;
		top: -50px;
		animation: animloader 4s ease infinite;
	}
	.loader::after {
		content: '';
		box-sizing: border-box;
		position: absolute;
		left: 0;
		top: 0;
		width: 50px;
		height: 50px;
		background: rgba(255, 255, 255, 0.85);
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
		animation: animloader2 2s ease infinite;
	}

	@keyframes animloader {
		0% {
			box-shadow: 0 50px rgba(255, 255, 255, 0), 50px 50px rgba(255, 255, 255, 0),
				50px 100px rgba(255, 255, 255, 0), 0px 100px rgba(255, 255, 255, 0);
		}
		12% {
			box-shadow: 0 50px white, 50px 50px rgba(255, 255, 255, 0), 50px 100px rgba(255, 255, 255, 0),
				0px 100px rgba(255, 255, 255, 0);
		}
		25% {
			box-shadow: 0 50px white, 50px 50px white, 50px 100px rgba(255, 255, 255, 0),
				0px 100px rgba(255, 255, 255, 0);
		}
		37% {
			box-shadow: 0 50px white, 50px 50px white, 50px 100px white, 0px 100px rgba(255, 255, 255, 0);
		}
		50% {
			box-shadow: 0 50px white, 50px 50px white, 50px 100px white, 0px 100px white;
		}
		62% {
			box-shadow: 0 50px rgba(255, 255, 255, 0), 50px 50px white, 50px 100px white, 0px 100px white;
		}
		75% {
			box-shadow: 0 50px rgba(255, 255, 255, 0), 50px 50px rgba(255, 255, 255, 0), 50px 100px white,
				0px 100px white;
		}
		87% {
			box-shadow: 0 50px rgba(255, 255, 255, 0), 50px 50px rgba(255, 255, 255, 0),
				50px 100px rgba(255, 255, 255, 0), 0px 100px white;
		}
		100% {
			box-shadow: 0 50px rgba(255, 255, 255, 0), 50px 50px rgba(255, 255, 255, 0),
				50px 100px rgba(255, 255, 255, 0), 0px 100px rgba(255, 255, 255, 0);
		}
	}

	@keyframes animloader2 {
		0% {
			transform: translate(0, 0) rotateX(0) rotateY(0);
		}
		25% {
			transform: translate(100%, 0) rotateX(0) rotateY(180deg);
		}
		50% {
			transform: translate(100%, 100%) rotateX(-180deg) rotateY(180deg);
		}
		75% {
			transform: translate(0, 100%) rotateX(-180deg) rotateY(360deg);
		}
		100% {
			transform: translate(0, 0) rotateX(0) rotateY(360deg);
		}
	}
</style>
