<script>
	// @ts-nocheck

	import WaveSurfer from 'wavesurfer.js';
	import { inView, animate } from 'motion';

	import { appWindow } from '@tauri-apps/api/window';
	import { onMount } from 'svelte';

	(async () => {
		await appWindow.setDecorations(true);
		// await appWindow.setFocus();
		// await appWindow.setSkipTaskbar(false);
	})();

	let playSpaceMusicButton;
	let remainTime;
	$: console.log(remainTime);

	const themes = [
		{
			timelineBg: 'bg-gray-900',
			primaryColor: 'text-red-600',
			primaryBgColor: 'bg-red-600',
			secondaryColor: 'text-gray-600',
			secondaryBgColor: 'bg-red-600',
			accentColor: 'bg-red-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-10',
			opacityBig: 'opacity-100'
		},
		{
			timelineBg: 'bg-white',
			primaryColor: 'text-lime-800',
			primaryBgColor: 'bg-lime-600',
			secondaryColor: 'text-lime-400',
			secondaryBgColor: 'bg-lime-400',
			accentColor: 'bg-red-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-10',
			opacityBig: 'opacity-60'
		},

		{
			timelineBg: 'bg-slate-50/50',
			primaryColor: 'text-red-800',
			primaryBgColor: 'bg-red-600',
			secondaryColor: 'text-red-400',
			secondaryBgColor: 'bg-red-400',
			accentColor: 'bg-red-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-20',
			opacityBig: 'opacity-60'
		},
		{
			timelineBg: 'bg-slate-50/50',
			primaryColor: 'text-purple-800',
			primaryBgColor: 'bg-purple-600',
			secondaryColor: 'text-purple-400',
			secondaryBgColor: 'bg-purple-400',
			accentColor: 'bg-purple-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-10',
			opacityBig: 'opacity-60'
		},
		{
			timelineBg: 'bg-black',
			primaryColor: 'text-lime-500',
			primaryBgColor: 'bg-lime-700',
			secondaryColor: 'text-lime-400',
			secondaryBgColor: 'bg-lime-400',
			accentColor: 'bg-lime-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-10',
			opacityBig: 'opacity-60'
		},
		{
			timelineBg: 'bg-black',
			primaryColor: 'text-yellow-500',
			primaryBgColor: 'bg-yellow-700',
			secondaryColor: 'text-yellow-400',
			secondaryBgColor: 'bg-yellow-400',
			accentColor: 'bg-yellow-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-10',
			opacityBig: 'opacity-60'
		},
		{
			timelineBg: 'bg-red-600',
			primaryColor: 'text-red-100',
			primaryBgColor: 'bg-white',
			secondaryColor: 'text-red-50',
			secondaryBgColor: 'bg-white',
			accentColor: 'bg-red-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-10',
			opacityBig: 'opacity-90'
		},
		{
			timelineBg: 'bg-slate-800',
			primaryColor: 'text-white',
			primaryBgColor: 'bg-white',
			secondaryColor: 'text-white',
			secondaryBgColor: 'bg-white',
			accentColor: 'bg-red-600',
			opacitySmall: 'opacity-40',
			opacityTiny: 'opacity-10',
			opacityBig: 'opacity-60'
		}
	];

	let theme = 2;

	/**
	 * @type {HTMLDivElement}
	 */
	let timeline;
	/**
	 * @type {DOMRectReadOnly}
	 */
	let timelineInfo;
	/**
	 * @type {number}
	 */
	let timelinePercent;
	let currentTimelinePositionPercentage;
	let currentTimelinePositionPercentage2;
	onMount(() => {
		// drawSmallLines(timelineInfo);
		timeline.addEventListener('mousemove', (e) => {
			// console.log(timelineInfo);
			// console.log('Mouse at x: ' + e.x);
			// console.log('Timeline at x: ' + timelineInfo.x);
			// console.log('Timeline width: ' + timelineInfo.width);
			// console.log('');
			// console.log('');
			// console.log('Mouse offset at x: ' + Math.max(0, e.offsetX));

			// current position on the timeline
			// let currentTimelinePosition = Math.max(0, e.offsetX);
			currentTimelinePositionPercentage =
				Math.min(Math.max(0, e.offsetX), timelineInfo.width) / timelineInfo.width;
			currentTimelinePositionPercentage2 =
				Math.min(Math.max(0, e.x - timelineInfo.x), timelineInfo.width) / timelineInfo.width;

			// console.log(Math.round(currentTimelinePositionPercentage * 100));
			// console.log(Math.round(currentTimelinePositionPercentage2 * 100));
			// console.log(currentTimelinePositionPercentage2 - currentTimelinePositionPercentage);

			//  Math.min(), timelineInfo.width) / timelineInfo.width;
			// console.log('Percent: ' + currentTimelinePositionPercentage);
			// Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
		});

		timeline.addEventListener('click', (e) => {
			// e.x;
			// console.log(Math.min(Math.max(0, e.offsetX), timelineInfo.width) / timelineInfo.width);
			timelinePercent = percent(e.offsetX);
			/**
			 * @param {number} number
			 */
			function percent(number) {
				let calc = Math.min(Math.max(0, number), timelineInfo.width) / timelineInfo.width;
				return Math.round(calc * 100);
			}
		});

		/**
		 * @param {DOMRectReadOnly} getTimeline
		 */
		(() => {
			// console.log(timelineInfo);

			let prev_timelinePositionPercentage;
			let prev_timelinePositionPercentageSmall;
			let prev_timelinePositionPercentageTiny;

			let timelineWidth = document.querySelector('#my-timeline')?.clientWidth;
			for (let i = 0.0; i <= timelineWidth; i++) {
				// console.log(i);
				let timelinePositionPercentage = Math.round(
					(Math.min(Math.max(0, i), timelineWidth) / timelineWidth) * 100
				);

				let justTimelinePercent = (Math.min(Math.max(0, i), timelineWidth) / timelineWidth) * 100;
				// console.log(justTimelinePercent);

				if (timelinePositionPercentage % 10 === 0) {
					if (timelinePositionPercentage === prev_timelinePositionPercentage) {
						continue;
					} else {
						timeline.innerHTML += `<div
						style="left: ${timelinePositionPercentage}%;"
						class="  absolute top-[10%] use_w-1_h-1/5 w-1 h-1/5 ${
							themes[theme].primaryBgColor
						} rounded-full pointer-events-none transition-all duration-300 ease-out"
						></div>
						<h2
							style="left: ${timelinePositionPercentage - 0.4}%;"
							class="!z-10 absolute top-[35%]  w-fit h-fit font-[Poppins] text-xl font-semibold ${
								themes[theme].primaryColor
							} pointer-events-none transition-all duration-300 ease-out"
						>${timelinePositionPercentage}</h2>
						`;

						prev_timelinePositionPercentage = timelinePositionPercentage;
					}
					// console.log(timelinePositionPercentage);
				}

				if (timelinePositionPercentage % 1 === 0 && timelinePositionPercentage % 10 !== 0) {
					if (timelinePositionPercentage === prev_timelinePositionPercentageSmall) {
						continue;
					} else {
						timeline.innerHTML += `<div
							style="left: ${timelinePositionPercentage}%;"
							class="absolute top-[46%] w-[1px] use_h-1/5_with_top-[30%] h-6 rounded-full ${
								themes[theme].opacitySmall
							} ${
							themes[theme].secondaryBgColor
						} pointer-events-auto transition-all duration-300 ease-out"
						>
						
						</div>
						
						<h2
							style="left: ${timelinePositionPercentage - 0.1}%;"
							class="!z-10 absolute top-[80%]  w-fit h-fit font-[Poppins] text-[12px] font-normal ${
								themes[theme].secondaryColor
							} pointer-events-auto transition-all duration-300 ease-out"
						>${timelinePositionPercentage}</h2>
						`;
						prev_timelinePositionPercentageSmall = timelinePositionPercentage;
					}
				}

				if (justTimelinePercent % 0.1 <= 0.5) {
					if (justTimelinePercent === prev_timelinePositionPercentageTiny) {
						continue;
					} else {
						timeline.innerHTML += `<div
							style="left: ${justTimelinePercent}%;"
							class="absolute top-[95%] w-[3px] h-[3px] rounded-none ${themes[theme].opacityBig} ${
							themes[theme].primaryBgColor
						} pointer-events-auto transition-all duration-300 ease-out"
						>
						
						</div>

						 
						<div
							style="left: ${justTimelinePercent}%;"
							class="absolute use_30%  top-[60%] w-[1px] h-3 rounded-full ${themes[theme].opacityTiny} ${
							themes[theme].secondaryBgColor
						} pointer-events-auto transition-all duration-300 ease-out"
						>
						
						</div>

						
						<h2
							style="left: ${justTimelinePercent - 0.2}%;"
							class="!z-10 ${
								themes[theme].opacityBig
							} absolute top-[100%]  w-fit h-fit font-[Poppins] text-[7px] font-normal ${
							themes[theme].primaryColor
						} pointer-events-auto transition-all duration-300 ease-out"
						>${justTimelinePercent.toFixed(1)}</h2>
						`;
						prev_timelinePositionPercentageTiny = justTimelinePercent;
					}
				}
			}
		})();

		const wavesurfer = WaveSurfer.create({
			container: '#waveform',
			waveColor: '#4F4A85',
			barHeight: 0.3,
			barWidth: 3,
			barRadius: 100,
			barGap: 2,
			barAlign: 'bottom',
			progressColor: '#383351',
			url: '/src/lib/music/SIMPAGARARA  by  Vestine And Dorcas ( Official Video2021)(MP3_128K).mp3'
		});

		// timeline
		wavesurfer.on('timeupdate', (e) => {
			remainTime = wavesurfer.getDuration() - e;
			console.log(remainTime);
		});

		// url: '/src/lib/music/Mercy Chinwo - Obinasom (Official Video)(MP3_128K).mp3'
		playSpaceMusicButton.addEventListener('click', (e) => {
			wavesurfer.play();

			animate('#timeline-holder', { right: 0 }, { duration: 30, easing: 'linear' });
		});
	});
</script>

<main class=" flex flex-col items-center justify-center w-screen h-screen bg-white mx-auto">
	<div id="waveform" class="w-full h-[200px]" />
	<button bind:this={playSpaceMusicButton} type="button">Play Music</button>
	<div
		class=" relative flex flex-col items-center justify-center w-screen h-screen px-4 {themes[theme]
			.timelineBg}"
	>
		<div id="timeline-holder" class="w-fit absolute top-1/2 -right-[150%] px-20">
			<div
				id="my-timeline"
				bind:this={timeline}
				bind:contentRect={timelineInfo}
				class=" ml-20 self-start relative w-[3000px] h-[100px] bg-transparent transition-all duration-300 ease-out"
			>
				<div
					style="left: {timelinePercent}%; "
					class="sr-only absolute top-1/2 mx-auto w-3 h-full bg-yellow-500 pointer-events-none transition-all duration-300 ease-out"
				/>
			</div>
		</div>
	</div>
</main>
