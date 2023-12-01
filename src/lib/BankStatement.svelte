<script>
	// @ts-nocheck
	import {activeFieldName} from '../activeFieldNameStore.js' 

	import { invoke } from '@tauri-apps/api/tauri';

	import { createDir, writeBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';

	import { jsPDF } from 'jspdf';
	import html2canvas from 'html2canvas';
	import html2pdf from 'html2pdf.js';
	import { PDFDocument } from 'pdf-lib';

	import { concat, uniqWith, isEqual, uniqBy } from 'lodash';
	//import isEqual from 'lodash/isEqual';

	import { cubicInOut, cubicOut, elasticOut, elasticInOut } from 'svelte/easing';
	import { derived, writable } from 'svelte/store';
	import { draw, fade, scale, slide } from 'svelte/transition';

	// import logo images
	import cogeBankLogo from '$lib/assets/images/CB.jpg' 
	import equityBankLogo from '$lib/assets/images/EQ.png' 
	import BKBankLogo from '$lib/assets/images/BK.png' 
	import bprBankLogo from '$lib/assets/images/BPR.png' 

	import Input from '$lib/Input.svelte';
	import InputRef from '$lib/InputRef.svelte';
	import InputDate from '$lib/InputDate.svelte';
	import InputNumber from '$lib/InputNumber.svelte';
	import SpinLoader3 from '$lib/SpinLoader3.svelte';
	import SpinLoaderPrinter from '$lib/SpinLoaderPrinter.svelte';
	import InputTextarea from '$lib/InputTextArea.svelte';
	import InputNumberAmount from '$lib/InputNumberAmount.svelte';
	import AccountSummaryComponent from '$lib/AccountSummaryComponent.svelte';
	import showColumnWithColorToggleCheck from '$lib/ShowColumnWithColorToggleCheck.svelte';
	import { onDestroy, onMount, createEventDispatcher } from 'svelte';

	import {
		clamp,
		eachDayOfInterval,
		getTime,
		getDate,
		format,
		isWithinInterval,
		lightFormat
	} from 'date-fns';
	import ShowColumnWithColorToggleCheck from '$lib/ShowColumnWithColorToggleCheck.svelte';

	let pdf;

	function formatAmount(
		amount = 0,
		style = 'currency',
		currency = 'USD',
		locale = 'en-US',
		decimalplace = 2
	) {
		const number = parseFloat(amount);

		const formattedCurrency = new Intl.NumberFormat(locale, {
			style: style,
			currency: currency,
			minimumFractionDigits: decimalplace
		}).format(amount);

		return formattedCurrency;
	}

	$: time = '00:00:00';
	let bundleSizeStore = writable(5)

	let documentIsExporting = writable(false);
	let fordgingStatus = writable('initial'); // initial, fordging, exporting, done.
	let fordgingStatusDetail = writable('Starting...');
	let downloadProgress = writable(0);
	// $: console.log($downloadProgress);

	// Default Header Choise
	let displayHeaderChoice = writable(4);

	// Default logo Image
	let logoUrl = writable('');
	// show or hide logo Image
	let isShowingLogoImage = writable(true);

	let canShowCanvas = false;

	let initialBalance = 22098.23 + 203.24;
	let previousBalance = writable(7142.38); // 2784.38
	let curency = writable('$');
	let totalBalanceIn = writable(0.0);
	let totalBalanceOut = writable(0.0);

	// let lastRowBalance = writable(initialBalance);
	let previousRowBalance = writable($previousBalance);

	

	// Editor's tabs expansion variables
	let expandedAccountInformation = writable(false);
	let expandedContactInformation = writable(false);
	//

	let selectedRowUUID = writable('3bf8166c-13cd-4f4b-8f64-517adee1afad');
	let activeRecordID = writable(0);
	let selectedCurrencyID = writable(0);

	// $: console.log($activeRecordID);
	let activeTheme = writable(12);

	let isCellFocused = writable(false);
	// let activeFieldName = writable('');
	// $: console.log($activeFieldName);

	let identifier = 'showmore-field';

	// let identifierField;

	let zoomLevel = writable(0.9);

	let transition = 'transition-all duration-300 ease-out';

	const documentThemes = writable([
		{
			name: 'purple',
			ring: 'ring-purple-600',
			ringFocus: 'focus:ring-purple-600',
			primaryText: 'text-purple-500',
			primaryActiveText: 'text-purple-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-purple-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-purple-50/10',
			primaryBg: 'bg-purple-600',
			primaryBgHover: 'hover:bg-purple-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-purple-500',
			bgEven: 'even:bg-purple-50/60',
			bgFromEven: 'bg-purple-50/60',
			bgOdd: ''
		},
		{
			name: 'blue',
			ring: 'ring-blue-600',
			ringFocus: 'focus:ring-blue-600',
			primaryText: 'text-blue-500',
			primaryActiveText: 'text-blue-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-blue-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-blue-50/10',
			primaryBg: 'bg-blue-600',
			primaryBgHover: 'hover:bg-blue-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-blue-500',
			bgEven: 'even:bg-blue-50/60',
			bgFromEven: 'bg-blue-50/60',
			bgOdd: ''
		},
		{
			name: 'sky',
			ring: 'ring-sky-600',
			ringFocus: 'focus:ring-sky-600',
			primaryText: 'text-sky-500',
			primaryActiveText: 'text-sky-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-sky-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-sky-50/10',
			primaryBg: 'bg-sky-600',
			primaryBgHover: 'hover:bg-sky-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-sky-500',
			bgEven: 'even:bg-sky-50/60',
			bgFromEven: 'bg-sky-50/60',
			bgOdd: ''
		},
		{
			name: 'teal',
			ring: 'ring-teal-600',
			ringFocus: 'focus:ring-teal-600',
			primaryText: 'text-teal-500',
			primaryActiveText: 'text-teal-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-teal-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-teal-50/10',
			primaryBg: 'bg-teal-600',
			primaryBgHover: 'hover:bg-teal-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-teal-500',
			bgEven: 'even:bg-teal-50/60',
			bgFromEven: 'bg-teal-50/60',
			bgOdd: ''
		},
		{
			name: 'pink',
			ring: 'ring-pink-600',
			ringFocus: 'focus:ring-pink-600',
			primaryText: 'text-pink-500',
			primaryActiveText: 'text-pink-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-pink-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-pink-50/10',
			primaryBg: 'bg-pink-600',
			primaryBgHover: 'hover:bg-pink-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-pink-500',
			bgEven: 'even:bg-pink-50/60',
			bgFromEven: 'bg-pink-50/60',
			bgOdd: ''
		},
		{
			name: 'red',
			ring: 'ring-red-600',
			ringFocus: 'focus:ring-red-600',
			primaryText: 'text-red-500',
			primaryActiveText: 'text-red-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-red-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-red-50/10',
			primaryBg: 'bg-red-600',
			primaryBgHover: 'hover:bg-red-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-red-500',
			bgEven: 'even:bg-red-50/60',
			bgFromEven: 'bg-red-50/60',
			bgOdd: ''
		},
		{
			name: 'lime',
			ring: 'ring-lime-600',
			ringFocus: 'focus:ring-lime-600',
			primaryText: 'text-lime-500',
			primaryActiveText: 'text-lime-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-lime-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-lime-50/10',
			primaryBg: 'bg-lime-600',
			primaryBgHover: 'hover:bg-lime-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-lime-500',
			bgEven: 'even:bg-lime-50/60',
			bgFromEven: 'bg-lime-50/60',
			bgOdd: ''
		},
		{
			name: 'green',
			ring: 'ring-green-600',
			ringFocus: 'focus:ring-green-600',
			primaryText: 'text-green-500',
			primaryActiveText: 'text-green-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-green-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-green-50/10',
			primaryBg: 'bg-green-600',
			primaryBgHover: 'hover:bg-green-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-green-500',
			bgEven: 'even:bg-green-50/60',
			bgFromEven: 'bg-green-50/60',
			bgOdd: ''
		},
		{
			name: 'yellow',
			ring: 'ring-yellow-600',
			ringFocus: 'focus:ring-yellow-600',
			primaryText: 'text-yellow-500',
			primaryActiveText: 'text-yellow-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-yellow-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-yellow-50/10',
			primaryBg: 'bg-yellow-600',
			primaryBgHover: 'hover:bg-yellow-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-yellow-500',
			bgEven: 'even:bg-yellow-50/60',
			bgFromEven: 'bg-yellow-50/60',
			bgOdd: ''
		},
		{
			name: 'orange',
			ring: 'ring-orange-600',
			ringFocus: 'focus:ring-orange-600',
			primaryText: 'text-orange-500',
			primaryActiveText: 'text-orange-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-orange-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-orange-50/10',
			primaryBg: 'bg-orange-600',
			primaryBgHover: 'hover:bg-orange-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-orange-500',
			bgEven: 'even:bg-orange-50/60',
			bgFromEven: 'bg-orange-50/60',
			bgOdd: ''
		},
		{
			name: 'slate',
			ring: 'ring-slate-600',
			ringFocus: 'focus:ring-slate-600',
			primaryText: 'text-slate-500',
			primaryActiveText: 'text-slate-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-slate-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-slate-50/10',
			primaryBg: 'bg-slate-600',
			primaryBgHover: 'hover:bg-slate-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-slate-500',
			bgEven: 'even:bg-slate-50/60',
			bgFromEven: 'bg-slate-50/60',
			bgOdd: ''
		},
		{
			name: 'gray',
			ring: 'ring-gray-600',
			ringFocus: 'focus:ring-gray-600',
			primaryText: 'text-gray-500',
			primaryActiveText: 'text-gray-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-gray-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-gray-50/10',
			primaryBg: 'bg-gray-600',
			primaryBgHover: 'hover:bg-gray-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-gray-500',
			bgEven: 'even:bg-gray-50/60',
			bgFromEven: 'bg-gray-50/60',
			bgOdd: ''
		},
		{
			name: 'amber',
			ring: 'ring-amber-600',
			ringFocus: 'focus:ring-amber-600',
			primaryText: 'text-amber-500',
			primaryActiveText: 'text-amber-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-amber-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-amber-50/10',
			primaryBg: 'bg-amber-600',
			primaryBgHover: 'hover:bg-amber-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-amber-500',
			bgEven: 'even:bg-amber-50/60',
			bgFromEven: 'bg-amber-50/60',
			bgOdd: ''
		},
		{
			name: 'emerald',
			ring: 'ring-emerald-600',
			ringFocus: 'focus:ring-emerald-600',
			primaryText: 'text-emerald-500',
			primaryActiveText: 'text-emerald-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-emerald-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-emerald-50/10',
			primaryBg: 'bg-emerald-600',
			primaryBgHover: 'hover:bg-emerald-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-emerald-500',
			bgEven: 'even:bg-emerald-50/60',
			bgFromEven: 'bg-emerald-50/60',
			bgOdd: ''
		},
		{
			name: 'cyan',
			ring: 'ring-cyan-600',
			ringFocus: 'focus:ring-cyan-600',
			primaryText: 'text-cyan-500',
			primaryActiveText: 'text-cyan-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-cyan-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-cyan-50/10',
			primaryBg: 'bg-cyan-600',
			primaryBgHover: 'hover:bg-cyan-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-cyan-500',
			bgEven: 'even:bg-cyan-50/60',
			bgFromEven: 'bg-cyan-50/60',
			bgOdd: ''
		},
		{
			name: 'indigo',
			ring: 'ring-indigo-600',
			ringFocus: 'focus:ring-indigo-600',
			primaryText: 'text-indigo-500',
			primaryActiveText: 'text-indigo-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-indigo-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-indigo-50/10',
			primaryBg: 'bg-indigo-600',
			primaryBgHover: 'hover:bg-indigo-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-indigo-500',
			bgEven: 'even:bg-indigo-50/60',
			bgFromEven: 'bg-indigo-50/60',
			bgOdd: ''
		},
		{
			name: 'violet',
			ring: 'ring-violet-600',
			ringFocus: 'focus:ring-violet-600',
			primaryText: 'text-violet-500',
			primaryActiveText: 'text-violet-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-violet-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-violet-50/10',
			primaryBg: 'bg-violet-600',
			primaryBgHover: 'hover:bg-violet-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-violet-500',
			bgEven: 'even:bg-violet-50/60',
			bgFromEven: 'bg-violet-50/60',
			bgOdd: ''
		},
		{
			name: 'fuchsia',
			ring: 'ring-fuchsia-600',
			ringFocus: 'focus:ring-fuchsia-600',
			primaryText: 'text-fuchsia-500',
			primaryActiveText: 'text-fuchsia-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-fuchsia-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-fuchsia-50/10',
			primaryBg: 'bg-fuchsia-600',
			primaryBgHover: 'hover:bg-fuchsia-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-fuchsia-500',
			bgEven: 'even:bg-fuchsia-50/60',
			bgFromEven: 'bg-fuchsia-50/60',
			bgOdd: ''
		},
		{
			name: 'rose',
			ring: 'ring-rose-600',
			ringFocus: 'focus:ring-rose-600',
			primaryText: 'text-rose-500',
			primaryActiveText: 'text-rose-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-rose-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-rose-50/10',
			primaryBg: 'bg-rose-600',
			primaryBgHover: 'hover:bg-rose-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-rose-500',
			bgEven: 'even:bg-rose-50/60',
			bgFromEven: 'bg-rose-50/60',
			bgOdd: ''
		},
		{
			name: 'stone',
			ring: 'ring-stone-600',
			ringFocus: 'focus:ring-stone-600',
			primaryText: 'text-stone-500',
			primaryActiveText: 'text-stone-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-stone-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-stone-50/10',
			primaryBg: 'bg-stone-600',
			primaryBgHover: 'hover:bg-stone-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-stone-500',
			bgEven: 'even:bg-stone-50/60',
			bgFromEven: 'bg-stone-50/60',
			bgOdd: ''
		},
		{
			name: 'neutral',
			ring: 'ring-neutral-600',
			ringFocus: 'focus:ring-neutral-600',
			primaryText: 'text-neutral-500',
			primaryActiveText: 'text-neutral-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-neutral-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-neutral-50/10',
			primaryBg: 'bg-neutral-600',
			primaryBgHover: 'hover:bg-neutral-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-neutral-500',
			bgEven: 'even:bg-neutral-50/60',
			bgFromEven: 'bg-neutral-50/60',
			bgOdd: ''
		},
		{
			name: 'zinc',
			ring: 'ring-zinc-600',
			ringFocus: 'focus:ring-zinc-600',
			primaryText: 'text-zinc-500',
			primaryActiveText: 'text-zinc-500',
			activeText: 'text-gray-400',
			primaryBgUseFocus: 'bg-zinc-600/10',
			primaryGroupHoverBgUseFocus: 'group-hover:bg-zinc-50/10',
			primaryBg: 'bg-zinc-600',
			primaryBgHover: 'hover:bg-zinc-600',
			primaryBgAccent: '',
			accent: 'text-gray-400',
			accentHover: 'group-hover:text-gray-200',
			accentActive: 'text-gray-300',
			bgDoc: '',
			bgHeader: 'bg-zinc-500',
			bgEven: 'even:bg-zinc-50/60',
			bgFromEven: 'bg-zinc-50/60',
			bgOdd: ''
		}
	]);

	// {$documentThemes[$activeTheme].name}
	// {$documentThemes[$activeTheme].primaryText}
	// {$documentThemes[$activeTheme].primaryActiveText}
	// {$documentThemes[$activeTheme].activeText}
	// {$documentThemes[$activeTheme].primaryBg}
	// {$documentThemes[$activeTheme].primaryBgAccent}
	// {$documentThemes[$activeTheme].accent}
	// {$documentThemes[$activeTheme].accentActive}
	// {$documentThemes[$activeTheme].bgDoc}
	// {$documentThemes[$activeTheme].bgEven}
	// {$documentThemes[$activeTheme].bgOdd}

	// Detecting selected transaction record
	// /**
	//  * @param {number} recordIndex
	//  */
	// function detectTransactionRecord(recordIndex) {
	// 	if ($selectedRowUUID === $statements[0].transactions[recordIndex].uuid) {
	// 		$activeRecordID = recordIndex;
	// 		return $activeRecordID;
	// 	}
	// }

	// $: console.log($transactions);

	let currencies = writable([
		{
			label: 'American Dollar',
			symbol: '$',
			currency: 'USD',
			locale: 'en-US',
			exchange: '10%'
		},
		{
			label: ' Euro',
			symbol: '€',
			currency: 'EUR',
			locale: 'en-US',
			exchange: '10%'
		},

		{
			label: 'Rwandan Francs',
			symbol: 'RWF',
			currency: 'RWF',
			locale: 'en-US',
			exchange: '1.3%'
		},
		{
			label: ' Chinese Yuan Renminbi',
			symbol: '¥',
			currency: 'CNY',
			locale: 'zh-CN',
			exchange: '10%'
		},
		{
			label: 'British Pound Sterling',
			symbol: '£',
			currency: 'GBP',
			locale: 'en-US',
			exchange: '10%'
		},

		{
			label: 'Kenyan Shilling',
			symbol: 'KES',
			currency: 'KES',
			locale: 'en-KE',
			exchange: '1.3%'
		}
	]);

	// [
	// 	{
	// 		uuid: '9678c46d-77c7-4e99-a253-b01437d2d215',
	// 		ref: '3322',
	// 		date: '2023-03-01',
	// 		BookingDate: '2023-03-01',
	// 		valueDate: '2023-03-01',
	// 		description: 'Internet Bill',
	// 		more: '',
	// 		type: 'out',
	// 		amount: '4.00',
	// 		balance: '7138.38'
	// 	},
	// 	{
	// 		uuid: 'afc5d4dd-3b66-4729-919a-069e2f40d005',
	// 		ref: '3221',
	// 		date: '2023-03-02',
	// 		BookingDate: '2023-03-02',
	// 		valueDate: '2023-03-02',
	// 		description: 'Electric Bill',
	// 		more: '',
	// 		type: 'out',
	// 		amount: '5000.00',
	// 		balance: '2138.38'
	// 	},
	// 	{
	// 		uuid: '05263f4c-31a5-4adb-9988-456a249f533d',
	// 		ref: '4433',
	// 		date: '2023-03-03',
	// 		BookingDate: '2023-03-03',
	// 		valueDate: '2023-03-03',
	// 		description: 'Check No. 4598',
	// 		more: 'Payment from Lisa Williams',
	// 		type: 'out',
	// 		amount: '0.06',
	// 		balance: '2138.32'
	// 	},
	// 	{
	// 		uuid: '4fa76aa0-9ce8-4ebc-8af3-5aa04af1a84a',
	// 		ref: '3338',
	// 		date: '2023-03-04',
	// 		BookingDate: '2023-03-04',
	// 		valueDate: '2023-03-04',
	// 		description: 'Deposit from Credit Card Processor',
	// 		more: '',
	// 		type: 'in',
	// 		amount: '9000.00',
	// 		balance: '11138.32'
	// 	},
	// 	{
	// 		uuid: '12afaedd-96de-4a10-95c8-2e82c8cbe187',
	// 		ref: '9999',
	// 		date: '2023-03-05',
	// 		BookingDate: '2023-03-05',
	// 		valueDate: '2023-03-05',
	// 		description: 'Payroll Run',
	// 		more: '',
	// 		type: 'out',
	// 		amount: '0.06',
	// 		balance: '11138.26'
	// 	},
	// 	{
	// 		uuid: '56045f8f-348d-43a6-b504-7af88c6f5451',
	// 		ref: '1178',
	// 		date: '2023-03-06',
	// 		BookingDate: '2023-03-06',
	// 		valueDate: '2023-03-06',
	// 		description: 'Debit Transaction',
	// 		more: 'Main Office Wholesale',
	// 		type: 'in',
	// 		amount: '28200.00',
	// 		balance: '39338.26'
	// 	},
	// 	{
	// 		uuid: '962a1a0d-1abe-466b-902b-8478f1f5157c',
	// 		ref: '4699',
	// 		date: '2023-03-07',
	// 		BookingDate: '2023-03-07',
	// 		valueDate: '2023-03-07',
	// 		description: 'Rent Bil',
	// 		more: '',
	// 		type: 'out',
	// 		amount: '0.06',
	// 		balance: '39338.20'
	// 	},
	// 	{
	// 		uuid: '4135f396-e9e8-46cd-82d6-06af1d31f683',
	// 		ref: '4428',
	// 		date: '2023-03-08',
	// 		BookingDate: '2023-03-08',
	// 		valueDate: '2023-03-08',
	// 		description: 'Check No. 234',
	// 		more: 'Payment from Mark Moore',
	// 		type: 'out',
	// 		amount: '4.00',
	// 		balance: '39334.20'
	// 	},
	// 	{
	// 		uuid: 'bc9e00d5-3ed7-4f44-9f25-8c60672e0791',
	// 		ref: '4611',
	// 		date: '2023-03-09',
	// 		BookingDate: '2023-03-09',
	// 		valueDate: '2023-03-09',
	// 		description: 'Payroll Run',
	// 		more: '',
	// 		type: 'out',
	// 		amount: '9100.00',
	// 		balance: '30234.20'
	// 	},
	// 	{
	// 		uuid: '663af1f4-a4ab-4dbb-83ed-b1aca992b758',
	// 		ref: '4678',
	// 		date: '2023-03-10',
	// 		BookingDate: '2023-03-10',
	// 		valueDate: '2023-03-10',
	// 		description: 'Deposit',
	// 		more: '',
	// 		type: 'out',
	// 		amount: '0.06',
	// 		balance: '30234.14'
	// 	},
	// 	{
	// 		uuid: 'b2d26b1f-64eb-4b45-a3b9-48859db99b25',
	// 		ref: '4278',
	// 		date: '2023-03-11',
	// 		BookingDate: '2023-03-11',
	// 		valueDate: '2023-03-11',
	// 		description: 'Debit Transactions',
	// 		more: 'ABC Business Supplies',
	// 		type: 'out',
	// 		amount: '1548.96',
	// 		balance: '28685.18'
	// 	}
	// ];

	let statements = writable([
		{
			title: {
				label: 'Statement Title',
				value: 'Account Statement'
			},
			id: {
				label: 'Statement ID',
				value: '4041100418152'
			},
			note: {
				label: 'NOTE:',
				value:
					'Note: Any ommision or errors in this statement should be promptly advised in writing to the Branch Manager within 30 days from the date of receipt otherwise the account will be presumed to be in order'
			},

			bankInfo: {
				name: {
					label: 'Bank Name',
					value: 'BPR Bank Rwanda, Plc.'
				},
				poBox: {
					label: 'PO.Box',
					value: 'PO.Box: 75104 - 00200 Nairobi'
				},
				fax: {
					label: 'Fax',
					value: '2737276'
				},
				street: {
					label: 'Street',
					value: 'Street KN 64 Plot No 4'
				},
				address: {
					label: 'Bank Address',
					value: 'Kigali, Rwanda'
				},
				city: {
					label: 'City',
					value: 'KAMAREBE'
				},
				capital: {
					label: 'Capital',
					value: 'REMERA'
				},
				call: {
					mobile: {
						label: 'Mobile',
						value: '0711026000'
					},
					office: {
						label: 'Office Line',
						value: '250788187200'
					},
					center: {
						label: 'Call Center',
						value: '1500'
					}
				},

				email: {
					label: 'Email',
					value: 'info@bpr.rw, contactus@bpr.rw'
				},
				website: {
					label: 'Website',
					value: 'www.bpr.rw'
				},
				image: {
					label: 'This is the image title',
					value: '/images/bpr.png'
				}
			},
			accountInfo: {
				name: {
					label: 'Account Name',
					value: 'BPR Bank Rwanda, Plc.'
				},
				customer: {
					name: {
						label: 'Customer Name',
						value: 'SONDERA MARIE GRACE'
					}
				},
				printedBy: {
					name: {
						label: 'Printed By',
						value: 'Andrew KAMWAKA'
					}
				},
				product: {
					name: {
						label: 'Product Name',
						value: 'SBA'
					}
				},

				number: {
					label: 'Account Number',
					value: '0000-01390051303-01' // 504428641237412
				},
				IBAN: {
					label: 'IBAN Internal Bank Acc. No.',
					value: 'RW73040100001240077646'
				},
				accountType: {
					label: 'Account Type',
					value: 'SME Current Account'
				},
				currency: {
					label: 'Account Currency',
					value: '' // label, symbol, exchange
				},
				branch: {
					name: {
						label: 'Branch Name',
						value: 'GISOZI BRANCH'
					},
					id: {
						label: 'Branch ID',
						value: '4012'
					}
				}
			},
			duration: {
				dateRanges: {
					booking: {
						start: {
							label: 'Start Period',
							value: '2023-03-01'
						},
						end: {
							label: 'End Period',
							value: '2023-03-13'
						}
					},
					settlement: {
						start: {
							label: 'Start Period',
							value: '2023-03-01'
						},
						end: {
							label: 'End Period',
							value: '2023-03-13'
						}
					},
					newRange: {
						date: [],
						bookingDate: [],
						valueDate: []
					},
					dateDraftColection: []
				},
				start: {
					label: 'Start Period',
					value: '2023-08-01',
					legacy: '08/01/2023'
				},
				end: {
					label: 'End Period',
					value: '2023-09-13',
					legacy: '09/13/2023'
				},
				dueDate: {
					label: 'Date',
					value: '2023-09-13', // format like: Fri, 15 Sep 2023 - get an set this when user requests save doc
					formats: [
						'EEE, MMMM d, yyyy',
						'yyyy-MM-dd',
						'yyyy/MM/dd',
						'dd MMM yyyy',
						'dd MMMM yyyy',
						'MM-dd-yyyy',
						'MM/dd/yyyy',
						'MMMM d yyyy',
						'MM/dd/yy, hh:mm a'
					]
				},
				time: {
					label: 'Time',
					value: '12:47:29', // format like: 12:47:29 - get an set this when user requests save doc
					formats: ['HH:mm:ss', 'HH:mm', 'hh:mm:ss a', 'hh:mm a']
				}
			},
			accountSummary: {
				openingBalance: {
					label: 'Opening Balance',
					value: $previousBalance // Format as: $99.83 or 100.00Rwf
				},
				totalBalanceIn: {
					label: 'Total Credits',
					value: $totalBalanceIn // Format as: $99.83 or 100.00Rwf
				},
				totalBalanceOut: {
					label: 'Total Debits',
					value: $totalBalanceOut // Format as: $99.83 or 100.00Rwf
				},
				closingBalance: {
					label: 'Closing Balance',
					value: $previousRowBalance // Format as: $99.83 or 100.00Rwf
				}
			},
			transactions: [
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: true
					},
					uuid: crypto.randomUUID(),
					ref: '3322',
					date: '03/02',
					Bookingdate: '03/02',
					valueDate: '03/02',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Internet Bill',
					more: '',
					type: 'out',
					amount: 4.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3221',
					date: '03/05',
					Bookingdate: '03/05',
					valueDate: '03/05',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Electric Bill',
					more: '',
					type: 'out',
					amount: 5000.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4433',
					date: '03/06',
					Bookingdate: '03/06',
					valueDate: '03/06',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Check No. 4598',
					more: 'Payment from Lisa Williams',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3322',
					date: '03/02',
					Bookingdate: '03/02',
					valueDate: '03/02',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Internet Bill',
					more: '',
					type: 'out',
					amount: 4.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3221',
					date: '03/05',
					Bookingdate: '03/05',
					valueDate: '03/05',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Electric Bill',
					more: '',
					type: 'out',
					amount: 5000.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4433',
					date: '03/06',
					Bookingdate: '03/06',
					valueDate: '03/06',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Check No. 4598',
					more: 'Payment from Lisa Williams',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3338',
					date: '03/10',
					Bookingdate: '03/10',
					valueDate: '03/10',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Deposit from Credit Card Processor',
					more: '',
					type: 'in',
					amount: 9000.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '9999',
					date: '03/12',
					Bookingdate: '03/12',
					valueDate: '03/12',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Payroll Run',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '1178',
					date: '03/16',
					Bookingdate: '03/16',
					valueDate: '03/16',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Debit Transaction',
					more: 'Main Office Wholesale',
					type: 'in',
					amount: 28200.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4699',
					date: '03/21',
					Bookingdate: '03/21',
					valueDate: '03/21',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Rent Bil',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4428',
					date: '03/21',
					Bookingdate: '03/21',
					valueDate: '03/21',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Check No. 234',
					more: 'Payment from Mark Moore',
					type: 'out',
					amount: 4.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4611',
					date: '03/26',
					Bookingdate: '03/26',
					valueDate: '03/26',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Payroll Run',
					more: '',
					type: 'out',
					amount: 9100.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4678',
					date: '03/28',
					Bookingdate: '03/28',
					valueDate: '03/28',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Deposit',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4278',
					date: '03/29',
					Bookingdate: '03/29',
					valueDate: '03/29',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Debit Transactions',
					more: 'ABC Business Supplies',
					type: 'in',
					amount: 4800.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4611',
					date: '03/26',
					Bookingdate: '03/26',
					valueDate: '03/26',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Payroll Run',
					more: '',
					type: 'out',
					amount: 9100.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4678',
					date: '03/28',
					Bookingdate: '03/28',
					valueDate: '03/28',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Deposit',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4278',
					date: '03/29',
					Bookingdate: '03/29',
					valueDate: '03/29',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Debit Transactions',
					more: 'ABC Business Supplies',
					type: 'in',
					amount: 4800.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3322',
					date: '03/02',
					Bookingdate: '03/02',
					valueDate: '03/02',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Internet Bill',
					more: '',
					type: 'out',
					amount: 4.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3221',
					date: '03/05',
					Bookingdate: '03/05',
					valueDate: '03/05',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Electric Bill',
					more: '',
					type: 'out',
					amount: 5000.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4433',
					date: '03/06',
					Bookingdate: '03/06',
					valueDate: '03/06',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Check No. 4598',
					more: 'Payment from Lisa Williams',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3322',
					date: '03/02',
					Bookingdate: '03/02',
					valueDate: '03/02',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Internet Bill',
					more: '',
					type: 'out',
					amount: 4.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3221',
					date: '03/05',
					Bookingdate: '03/05',
					valueDate: '03/05',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Electric Bill',
					more: '',
					type: 'out',
					amount: 5000.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4433',
					date: '03/06',
					Bookingdate: '03/06',
					valueDate: '03/06',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Check No. 4598',
					more: 'Payment from Lisa Williams',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '3338',
					date: '03/10',
					Bookingdate: '03/10',
					valueDate: '03/10',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Deposit from Credit Card Processor',
					more: '',
					type: 'in',
					amount: 9000.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '9999',
					date: '03/12',
					Bookingdate: '03/12',
					valueDate: '03/12',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Payroll Run',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '1178',
					date: '03/16',
					Bookingdate: '03/16',
					valueDate: '03/16',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Debit Transaction',
					more: 'Main Office Wholesale',
					type: 'in',
					amount: 28200.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4699',
					date: '03/21',
					Bookingdate: '03/21',
					valueDate: '03/21',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Rent Bil',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4428',
					date: '03/21',
					Bookingdate: '03/21',
					valueDate: '03/21',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Check No. 234',
					more: 'Payment from Mark Moore',
					type: 'out',
					amount: 4.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4611',
					date: '03/26',
					Bookingdate: '03/26',
					valueDate: '03/26',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Payroll Run',
					more: '',
					type: 'out',
					amount: 9100.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4678',
					date: '03/28',
					Bookingdate: '03/28',
					valueDate: '03/28',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Deposit',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4278',
					date: '03/29',
					Bookingdate: '03/29',
					valueDate: '03/29',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Debit Transactions',
					more: 'ABC Business Supplies',
					type: 'in',
					amount: 4800.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4611',
					date: '03/26',
					Bookingdate: '03/26',
					valueDate: '03/26',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Payroll Run',
					more: '',
					type: 'out',
					amount: 9100.0,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4678',
					date: '03/28',
					Bookingdate: '03/28',
					valueDate: '03/28',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Deposit',
					more: '',
					type: 'out',
					amount: 0.06,
					balance: $previousBalance
				},
				{
					dataManipulationConfig: {
						isEditRecordRestricted: false,
						isDeleteRecordRestricted: false,
						isCopyRecordRestricted: false,
						isRandomizeRecordDatesRestricted: true,
						isRecordDuplicationRestricted: false
					},
					uuid: crypto.randomUUID(),
					ref: '4278',
					date: '03/29',
					Bookingdate: '03/29',
					valueDate: '03/29',
					branch: 'Branch',
					ope: 'OPE323',
					narration: 'BKA D00002 5046 2 BK Head Office Kigali 00RW RWF',

					description: 'Debit Transactions',
					more: 'ABC Business Supplies',
					type: 'in',
					amount: 4800.0,
					balance: $previousBalance
				}
			],
			transactionHeaders: {
				date: {
					label: 'Date',
					terms: ['Date'],
					value: 'Date',
					render: true,
					order: 1,
					counter: 0
				},
				bookingDate: {
					label: 'Booking Date',
					terms: ['Booking Date', 'Date', 'Book Date', 'Transaction Date', 'Tran Date', 'Post Date', 'Ledger Date'],
					value: 'Booking Date',
					render: false, // configurations.ColumnHeaders.renderBookingDateColumn
					order: 2,
					counter: 0
				},
				valueDate: {
					label: 'Value Date ',
					terms: ['Value Date', 'Effective Date', 'Settlement Date'],
					value: 'Value Date',
					render: false, // configurations.ColumnHeaders.renderValueDateColumn
					order: 3,
					counter: 0
				},
				
				branch: {
					label: 'Branch',
					terms: ['Branch'],
					value: 'Branch',
					render: true, // configurations.ColumnHeaders.renderRefColumn
					order: 6,
					counter: 0
				}
				,
				ope: {
					label: 'OPE',
					terms: ['OPE'],
					value: 'OPE',
					render: true, // configurations.ColumnHeaders.renderRefColumn
					order: 6,
					counter: 0
				},
				type: {
					label: 'Trans. Type ',
					terms: ['Type', 'Transaction Type'],
					value: 'Type',
					render: false, // configurations.ColumnHeaders.renderValueDateColumn
					order: 4,
					counter: 0
				},
				uuid: {
					label: 'UUID',
					terms: [''],
					value: 'UUID',
					render: false, // configurations.ColumnHeaders.renderUUIDColumn
					order: 5,
					counter: 0
				},
				ref: {
					label: 'Reference',
					terms: ['Reference', 'Ref', 'Ref_No.', 'Instrument_ID', 'ID'],
					value: 'Refence',
					render: true, // configurations.ColumnHeaders.renderRefColumn
					order: 6,
					counter: 0
				},
				description: {
					label: 'Description',
					terms: ['Description', 'Desc', 'Particulars', 'Tran Particulars' ],
					value: 'Description',
					render: true, // configurations.ColumnHeaders.renderDescriptionColumn
					order: 7,
					counter: 0
				},
				narration: {
					label: 'Narration',
					terms: ['Narration'],
					value: 'Narration',
					render: true, // configurations.ColumnHeaders.renderDescriptionColumn
					order: 7,
					counter: 0
				},
				in: {
					label: 'Credits',
					terms: ['Credits', 'Credit', 'Deposits', 'Paid In', 'Money In'],
					value: 'Credits',
					render: true, // configurations.ColumnHeaders.renderInColumn
					order: 8,
					counter: 0
				},
				out: {
					label: 'Debits',
					terms: ['Debits', 'Debit', 'Withdrawals', 'Paid Out', 'Money Out'],
					value: 'Debits',
					render: true, // configurations.ColumnHeaders.renderOutColumn
					order: 9,
					counter: 0
				},
				balance: {
					label: 'Balance',
					terms: ['Balance', 'Closing Balance'],
					value: 'Balance',
					render: true, // configurations.ColumnHeaders.renderOutColumn
					order: 10,
					counter: 0
				}
			},
			newTransactions: [],
			footer: {
				ref: {
					label: 'Ref',
					value: 'Ref: 6f833131-dd0a-4bc0-a71e-c23d23269c65'
				},
				pagesCount: {
					label: 'Pages count',
					value: 'Page 1 of 1'
				},
				bankOfficer: {
					label: 'Bank Officer',
					value: 'Bank Officer: Andrew KAMWAKA'
				}
			},
			configurations: {
				dataManipulation: {
					isCreateNewRecordRestricted: false,
					isEditRecordRestricted: false,
					isDeleteRecordRestricted: false,
					isCopyRecordRestricted: false,
					isRandomizeRecordDatesRestricted: true,
					isRecordDuplicationRestricted: false
				},
				pageSettings: {
					pages: [],
					size: 15,
					pagesUUIDs: [],
					orientation: 'portrait', // landscape
					height: 297,
					width: 210,
					units: ['mm', 'in', 'px', 'pt'], // in,
					presets: {
						a4: [
							{
								unit: 'mm',
								height: 297,
								width: 210,
								orientation: 'portrait'
							},
							{
								unit: 'mm',
								height: 210,
								width: 297,
								orientation: 'portrait'
							}
						]
					}
				},
				theme: {},
				columnHeaders: {
					renderUUIDColumn: false,
					renderRefColumn: true,
					renderDateColumn: false,
					renderBookingDateColumn: true, //
					renderValueDateColumn: true,
					renderDescriptionColumn: true,
					renderBranchColumn: true,
					renderOpeColumn: true,
					renderNarrationColumn: true,
					renderInColumn: true,
					renderOutColumn: true,
					renderBalanceColumn: true,
					renderAllColumns: false
				},
				watermark: {
					render: false,
					type: ['logo', 'text']
				},
				renderStartingBalanceRow: true,
				renderEndingBalanceRow: false,
				renderShowMoreDesc: false,
				rowPadding: {
					top: true,
					bottom: true
				},
				renderBorders: {
					row: {
						all: false,
						top: false,
						left: false,
						right: false,
						size: 0.5, // em unit
						tint: '$documentThemes[$activeTheme].dividerColorX' // or simply '$documentThemes[$activeTheme].dividerColor'
					},
					cell: {
						all: false,
						top: false,
						left: false,
						right: false,
						size: 0.5, // em unit
						tint: '$documentThemes[$activeTheme].dividerColorX' // or simply '$documentThemes[$activeTheme].dividerColor'
					},
					all: false,
					top: false,
					left: false,
					right: false,
					size: 0.5, // em unit
					tint: '$documentThemes[$activeTheme].dividerColorX' // or simply '$documentThemes[$activeTheme].dividerColor'
				},
				time: {
					formats: ['HH:mm:ss', 'HH:mm', 'hh:mm:ss a', 'hh:mm a']
				},
				date: {
					formats: [
						'yyyy-MM-dd',
						'yyyy/MM/dd',
						'MM-dd-yyyy',
						'MM/dd/yyyy',
						'MMMM d yyyy',
						'EEE, MMMM d, yyyy',
						'MM/dd/yy, hh:mm a'
					]
				}
			}
		}
	]);

	let transactions = writable($statements[0].transactions);
	let fromSortedTransactions = [];

	// $: console.log($statements[0].transactionHeaders.in.counter);
	let showMoreDescription = writable($statements[0].configurations.renderShowMoreDesc || false);

	$: renderRowBorders = $statements[0].configurations.renderBorders.row.all;
	$: renderRowBorders_top = $statements[0].configurations.renderBorders.row.top;
	$: renderRowBorders_bottom = $statements[0].configurations.renderBorders.row.bottom;
	$: renderRowBorders_right = $statements[0].configurations.renderBorders.row.right;
	$: renderRowBorders_left = $statements[0].configurations.renderBorders.row.left;

	$: renderCellBorders = $statements[0].configurations.renderBorders.cell.all;
	$: renderCellBorders_top = $statements[0].configurations.renderBorders.cell.top;
	$: renderCellBorders_bottom = $statements[0].configurations.renderBorders.cell.bottom;
	$: renderCellBorders_right = $statements[0].configurations.renderBorders.cell.right;
	$: renderCellBorders_left = $statements[0].configurations.renderBorders.cell.left;

	// Formats

	// 1. 'yyyy-MM-dd' => '2023-09-15'
	// 2. 'MM/dd/yy => '09/15/23'
	// 3. 'MMMM d yyyy' => 'September 15, 2023'
	// 4. 'EEE, MMMM d, yyyy' => 'Fri, Sep 15, 2023'
	// 5. 'HH:mm:ss' => '14:30:00'
	// 6. 'hh:mm a' => '02:30 PM'
	// 7. 'MM/dd/yy, hh:mm a' => '2023-09-15'

	// $: console.log($statements[0].duration.time.value);

	/**
	 * @type {number | undefined}
	 */
	let intervalID;

	// show: {
	// 	uuid: true,
	// 	ref: true,
	// 	date: true,
	// 	description: true,
	// 	more: true,
	// 	type: true,
	// 	amount: true,
	// 	balance: true,
	// }

	let startDate = writable(
		lightFormat(new Date($statements[0].duration.start.value), 'yyyy/MM/dd')
	);
	let endDate = writable(lightFormat(new Date($statements[0].duration.end.value), 'yyyy/MM/dd'));
	// $: console.log($startDate);
	// $: console.log($endDate);
	// let startDate = writable(new Date('2023/03/01'));
	// let endDate = writable(new Date('2023/04/15'));

	// let dateRange = writable([]);
	// /**
	//  * @type {string[]}
	//  */
	// let newRange = [];
	// let dateRange = writable([{}]);

	// $: console.log($dateRange);

	// async function initiateSetDates() {
	//$activeRecordID = 0;
	//let startingdate = await startdate
	// let endingdate = await enddate;

	// 	$dateRange = eachDayOfInterval(
	// 		{
	// 			start: new Date($startDate),
	// 			end: new Date($endDate)
	// 		},
	// 		{ step: 1 }
	// 	);
	// 	$dateRange.forEach((date) => {
	// 		newRange.push(format(new Date(date), 'yyyy-MM-dd'));
	// 		// console.log()
	// 	});

	// 	if (typeof newRange === 'object') {
	// 		return {
	// 			newRange
	// 		};
	// 	} else {
	// 		throw new Error('Something is not right');
	// 	}
	// }

	/**
	 * @type {string[]}
	 */
	let newRange = writable({
		date: [],
		bookingDate: [],
		valueDate: []
	});

	// let newDateDraft = writable([]);
	// let newBookingDateDraft = writable([]);
	// let newValueDateDraft = writable([]);

	let dateRange = writable(
		eachDayOfInterval(
			{
				start: new Date($startDate),
				end: new Date($endDate)
			},
			{ step: 1 }
		)
	);

	$: $statements[0].duration.dateRanges.dateDraftColection = eachDayOfInterval(
		{
			start: new Date($startDate),
			end: new Date($endDate)
		},
		{ step: 1 }
	);
	// $: console.log($dateRange);

	$statements[0].duration.dateRanges.dateDraftColection.forEach((date, index) => {
		// newRange.push(format(new Date(date), 'yyyy-MM-dd'));
		$statements[0].duration.dateRanges.newRange.date.push(format(new Date(date), 'yyyy-MM-dd'));
		$statements[0].duration.dateRanges.newRange.bookingDate.push(
			format(new Date(date), 'yyyy-MM-dd')
		);
		$statements[0].duration.dateRanges.newRange.valueDate.push(
			format(new Date(date), 'yyyy-MM-dd')
		);

		// console.log()
	});

	$dateRange.forEach((date, index) => {
		// newRange.push(format(new Date(date), 'yyyy-MM-dd'));

		$newRange.date.push(format(new Date(date), 'yyyy-MM-dd'));
		$newRange.bookingDate.push(format(new Date(date), 'yyyy-MM-dd'));
		$newRange.valueDate.push(format(new Date(date), 'yyyy-MM-dd'));

		// console.log()
	});

	$: newDateDraft = writable($newRange.date);
	$: newBookingDateDraft = writable($newRange.bookingDate);
	$: newValueDateDraft = writable($newRange.valueDate);

	// $: console.log($newRange);
	// $: console.log($newRange);

	let bookingDateRangeMemorized = [];
	let isDateRangeMemorized = false;

	function randomizeDateRange(range) {
		bookingDateRangeMemorized = range;
		isDateRangeMemorized = true;

		let rangeMaxNumber = range.length;

		// let dateDraftColection = [];
		$statements[0].duration.dateRanges.dateDraftColection = [];
		// let newDateDraft = [];
		// let newBookingDateDraft = [];
		// let newValueDateDraft = [];

		range.forEach((date, index) => {
			let randomIndex = Math.floor(Math.random() * rangeMaxNumber);
			// dateDraftColection.push(format(new Date(range[randomIndex]), 'yyyy-MM-dd')); // Sort booking date ascendingly
			$statements[0].duration.dateRanges.dateDraftColection.push(
				format(new Date(range[randomIndex]), 'yyyy-MM-dd')
			); // Sort booking date ascendingly
		});
		// $newRange.date = [];
		// $newRange.bookingDate = [];
		// $newRange.valueDate = [];

		$statements[0].duration.dateRanges.dateDraftColection =
			$statements[0].duration.dateRanges.dateDraftColection.sort(
				(a, b) => new Date(a) - new Date(b)
			);

		$statements[0].newTransactions.forEach((_, idx) => {
			$statements[0].newTransactions[idx].date =
				$statements[0].duration.dateRanges.dateDraftColection[idx];
			$statements[0].newTransactions[idx].bookingDate =
				$statements[0].duration.dateRanges.dateDraftColection[idx];
			$statements[0].newTransactions[idx].valueDate =
				$statements[0].duration.dateRanges.dateDraftColection[idx];
		});

		$statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
			return new Date(a.bookingDate) - new Date(b.bookingDate);
		});
		computeTransactions($statements[0].newTransactions);

		// $statements[0].duration.dateRanges.newRange.date =
		// 	$statements[0].duration.dateRanges.dateDraftColection.sort(
		// 		(a, b) => new Date(a) - new Date(b)
		// 	);
		// $statements[0].duration.dateRanges.newRange.bookingDate =
		// 	$statements[0].duration.dateRanges.dateDraftColection.sort(
		// 		(a, b) => new Date(a) - new Date(b)
		// 	);
		// $statements[0].duration.dateRanges.newRange.valueDate =
		// 	$statements[0].duration.dateRanges.dateDraftColection.sort(
		// 		(a, b) => new Date(a) - new Date(b)
		// 	);

		// $newDateDraft = dateDraftColection.sort();
		// $newBookingDateDraft = dateDraftColection.sort();
		// $newValueDateDraft = dateDraftColection.sort();

		// $newRange.date = $newDateDraft;
		// $newRange.bookingDate = $newBookingDateDraft;
		// $newRange.valueDate = $newValueDateDraft;
		// clearInterval(intervalId);

		// console.log('Dates draft collection: ');
		// console.log($statements[0].duration.dateRanges.dateDraftColection);
	}

	function executeRandomizeDateRange() {
		if (isDateRangeMemorized === true) {
			randomizeDateRange(bookingDateRangeMemorized);
		} else {
			randomizeDateRange($statements[0].duration.dateRanges.dateDraftColection);
		}
	}

	// $: $statements[0].duration.dateRanges.dateDraftColection =
	// 	$statements[0].duration.dateRanges.dateDraftColection.sort((a, b) => new Date(a) - new Date(b));

	$: $newDateDraft = $newDateDraft.sort((a, b) => new Date(a) - new Date(b));
	$: $newBookingDateDraft = $newBookingDateDraft.sort((a, b) => new Date(a) - new Date(b));
	$: $newValueDateDraft = $newValueDateDraft.sort((a, b) => new Date(a) - new Date(b));

	//$: $transactions.bookingDate = $newBookingDateDraft;

	// $: $statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
	// 	return new Date(a.bookingDate) - new Date(b.bookingDate);
	// });
	// $: newTransactions = newTransactions.sort((a, b) => {
	// 	return new Date(a.bookingDate) - new Date(b.bookingDate);
	// });
	// $: transactions = transactions.sort((a, b) => {
	// 	return new Date(a.bookingDate) - new Date(b.bookingDate);
	// });

	// $: console.log($newDateDraft);
	// $: console.log($newBookingDateDraft);
	// $: console.log($newValueDateDraft);

	// $: $statements[0].transactions = $transactions;
	// $: console.log($statements);
	let count = 0;

	let createNewTransactionsFrom = writable('FRESH_CREATION');
	/**
	 * @param {any[]} transactions
	 */
	function computeTransactions(transactions) {
		// Map through transaction records, For each record/row
		// Get its type "in" or "out"
		// Calculate Record's balance by ( computeRecordBalance( $lastRowBalance, record.type )  )

		// transactions = [];
		if (transactions.length < 1) {
			// console.log('No transactions found to process!');
			return false;
		}
		// Reset newTransactions array before calculating it again
		newTransactions = [];
		$statements[0].newTransactions = [];

		// Reset in and out balances
		$totalBalanceIn = 0.0;
		$totalBalanceOut = 0.0;

		// $newDateDraft = $newDateDraft.sort((a, b) => a - b);
		// $newBookingDateDraft = $newBookingDateDraft.sort((a, b) => a - b);
		// $newValueDateDraft = $newValueDateDraft.sort((a, b) => a - b);

		// if (fromSortedTransactions.length > 0) {
		// 	transactions = fromSortedTransactions;
		// } else {
		// 	if ($statements[0].newTransactions.length > 1) {
		// 		transactions = $statements[0].newTransactions.sort((a, b) => {
		// 			return new Date(a.bookingDate) - new Date(b.bookingDate);
		// 		});
		// 	} else {
		// 		transactions = transactions.sort((a, b) => {
		// 			return new Date(a.bookingDate) - new Date(b.bookingDate);
		// 		});
		// 	}
		// }

		transactions.forEach((record, index) => {
			// console.log(record.date);
			// console.log(format(new Date(date), 'yyyy-MM-dd'));
			// console.log($newRange.date[index]);

			if (index === 0) {
				$previousRowBalance = $previousBalance;
			}

			// console.log(Array.from(record));
			computeRecordBalance($previousRowBalance, record.type, record.amount, index);

			/**
			 * @param {number} balance
			 * @param {string} type
			 * @param {number} amount
			 * @param {number} index
			 */
			function computeRecordBalance(balance, type, amount, index) {
				// if (index === 0) {
				// } else {
				// }
				// console.log('type: ' + type);
				if (type !== undefined) {
					if (type.toLowerCase() === 'in') {
						$previousRowBalance = balance + amount;

						// console.log(lightFormat(new Date(newRange[index]), 'MM/dd/yyyy'));

						newTransactions = newTransactions.sort((a, b) => {
							return new Date(a.bookingDate) - new Date(b.bookingDate);
						});
						// $statements[0].newTransactions = uniqWith($statements[0].newTransactions, isEqual);
						$statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
							return new Date(a.bookingDate) - new Date(b.bookingDate);
						});

						let newTransactionSegment = {
							dataManipulationConfig: record.dataManipulationConfig,
							uuid: record.uuid,
							ref: record.ref,
							date: record.date ?? $statements[0].duration.dateRanges.newRange.date[index], // $newDateDraft[index], //newRange[index],
							bookingDate:
								record.bookingDate ??
								$statements[0].duration.dateRanges.newRange.bookingDate[index], // $newBookingDateDraft[index], // newRange[index],
							valueDate:
								record.valueDate ?? $statements[0].duration.dateRanges.newRange.valueDate[index], // $newValueDateDraft[index], // newRange[index],
							branch: record.branch,
							ope: record.ope,
							narration: record.narration,	
							description: record.description,
							more: record.more,
							type: record.type,
							amount: record.amount, // !== null ? record.amount.toFixed(2) : 0,
							balance: $previousRowBalance.toFixed(2)
						};
						newTransactions.push(newTransactionSegment);

						// $statements[0].transactions.push(newTransactionSegment);
						$statements[0].newTransactions.push(newTransactionSegment);

						$totalBalanceIn = $totalBalanceIn + amount;
						return Math.max(0, $previousRowBalance).toFixed(2);
					} else if (type.toLowerCase() === 'out') {
						$previousRowBalance = balance - amount;

						newTransactions = newTransactions.sort((a, b) => {
							return new Date(a.bookingDate) - new Date(b.bookingDate);
						});
						// $statements[0].newTransactions = uniqWith($statements[0].newTransactions, isEqual);
						$statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
							return new Date(a.bookingDate) - new Date(b.bookingDate);
						});

						let newTransactionSegment = {
							dataManipulationConfig: record.dataManipulationConfig,
							uuid: record.uuid,
							ref: record.ref,
							date: record.date ?? $statements[0].duration.dateRanges.newRange.date[index], // $newDateDraft[index],
							bookingDate:
								record.bookingDate ??
								$statements[0].duration.dateRanges.newRange.bookingDate[index], // $newBookingDateDraft[index],
							valueDate:
								record.valueDate ?? $statements[0].duration.dateRanges.newRange.valueDate[index], // $newValueDateDraft[index],
							branch: record.branch,
							ope: record.ope,
							narration: record.narration,
							description: record.description,
							more: record.more,
							type: record.type,
							amount: record.amount, // !== null ? record.amount.toFixed(2) : 0,
							balance: $previousRowBalance.toFixed(2)
						};
						newTransactions.push(newTransactionSegment);
						// $statements[0].transactions.push(newTransactionSegment);
						$statements[0].newTransactions.push(newTransactionSegment);

						$totalBalanceOut = $totalBalanceOut + amount;
						return $previousRowBalance.toFixed(2);
					}
				}
			}
		});

		// executeRandomizeDateRange();

		// console.log(newTransactions);

		// $statements[0].transactions.push(transactions);

		$statements[0].accountSummary.openingBalance.value = $previousBalance;
		$statements[0].accountSummary.closingBalance.value = $previousRowBalance;
		$statements[0].accountSummary.totalBalanceOut.value = $totalBalanceOut;
		$statements[0].accountSummary.totalBalanceIn.value = $totalBalanceIn;

		// console.log($statements);

		// transactions.reduce((prev, curr) => {

		// }, []);
	}

	// $: $statements[0].newTransactions = uniqWith($statements[0].newTransactions, isEqual);

	function executeDuplicateCopy(newArray) {
		const interval = setInterval(() => {
			// console.log('2 Seconds after update!');
			// const objectArray = [];
			// for (const obj of fixDuplicateUUIDColision) {
			// 	// $statements[0].newTransactions.push(obj);
			// 	objectArray.push(obj);
			// }
			// console.log('Array from: ');
			// console.log(objectArray);

			// const data = Array.from(fixDuplicateUUIDColision);

			const newItems = [];
			newArray.forEach((item) => {
				newItems.push(item);
			});
			$statements[0].newTransactions.push(newItems);
			// $statements[0].newTransactions = newArray;

			$statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
				return new Date(a.bookingDate) - new Date(b.bookingDate);
			});
			// const getIndexForDuplicateCopy = $statements[0].newTransactions.indexOf(
			// 	duplicateCopy[0]
			// );

			computeTransactions($statements[0].newTransactions);
			// $selectedRowUUID = duplicateCopy[0].uuid;
			// $activeRecordID = getIndexForDuplicateCopy;

			return clearInterval(interval);
		}, 1000);
	}

	// $statements[0].newTransactions.length > 1
	// 	? syncDates(
	// 			$statements[0].duration.dateRanges.dateDraftColection,
	// 			$statements[0].newTransactions
	// 	  )
	// 	: '';

	function syncDates(draftColection, newTransactionsColection) {
		let draftColectionSize = draftColection.length;
		let newTransactionsColectionSize = newTransactionsColection.length;

		// console.log(draftColection);
		// console.log(newTransactionsColection);

		if (newTransactionsColectionSize > 1) {
			draftColection.forEach((record, index) => {
				if (draftColectionSize === newTransactionsColectionSize) {
					return;
				} else {
					// newTransactionsColection[index].date = record;
					// newTransactionsColection[index].bookingDate = record;
					// newTransactionsColection[index].valueDate = record;

					$statements[0].duration.dateRanges.newRange.date[index] = record;
					$statements[0].duration.dateRanges.newRange.bookingDate[index] = record;
					$statements[0].duration.dateRanges.newRange.valueDate[index] = record;
				}
			});
		}

		// $: $statements[0].newTransactions.length > 1
		// 	? syncDates(
		// 			$statements[0].duration.dateRanges.dateDraftColection,
		// 			$statements[0].newTransactions
		// 	  )
		// 	: '';
	}

	//

	/**
	 * @type {{ dataManipulationConfig: {isEditRecordRestricted: boolean; isDeleteRecordRestricted: boolean; isCopyRecordRestricted: boolean; isRecordDuplicationRestricted: Boolean, isRandomizeDatesRestricted: boolean}; uuid: string; ref: any; date: any; description: string; more: string; type: any; amount: any; balance: string; }[]}
	 */
	let newTransactions = [];

	$: $statements[0].newTransactions.length > 0
		? computeTransactions($statements[0].newTransactions)
		: computeTransactions($statements[0].newTransactions);

	$: computePages($statements[0].newTransactions);


	// $: $statements[0].newTransactions.length > 0
	// 	? computeTransactions($statements[0].newTransactions)
	// 	: computeTransactions($transactions);

	// $: $statements[0].newTransactions.length > 0
	// 	? computePages($statements[0].newTransactions)
	// 	: computePages($transactions);

	function computePages(inputArray) {
		const pageSize = Math.min($statements[0].configurations.pageSettings.size, 25);
		const totalItems = inputArray.length;
		const totalPages = Math.ceil(totalItems / pageSize);
		const pages = [];

		for (let page = 1; page <= totalPages; page++) {
			const startIdx = (page - 1) * pageSize;
			const endIdx = Math.min(startIdx + pageSize, totalItems);

			const pageContent = inputArray.slice(startIdx, endIdx);
			pages.push(pageContent);
		}

		$statements[0].configurations.pageSettings.pages = pages;
		// console.log(pages);
		// return pages

		isCurrentTransactionRecordBelongsToThisPage();
	}

	let pagesUUIDs = writable([1]);
	// function isCurrentTransactionRecordBelongsToThisPage(pageIndex, recordUUID, itemIndex) {
	function isCurrentTransactionRecordBelongsToThisPage() {
		$statements[0].configurations.pageSettings.pagesUUIDs = [];
		const myPages = $statements[0].configurations.pageSettings.pages;
		// $statements[0].configurations.pageSettings.pagesUUIDs = [];
		// for (let i = 0; i < myPages.length; i++) {
		myPages.forEach((page, idx) => {
			page.forEach((record) => {
				$statements[0].configurations.pageSettings.pagesUUIDs.push(idx);
				// $statements[0].configurations.pageSettings.pagesUUIDs = $statements[0].configurations.pageSettings.pagesUUIDs;
				// console.log($statements[0].configurations.pageSettings.pagesUUIDs);
			});
			// console.log($statements[0].configurations.pageSettings.pagesUUIDs);
		});

		// }

		// let decision = false;
		// $statements[0].configurations.pageSettings.pagesUUIDs.forEach((record, index) => {
		// 	if (itemIndex === index && pageIndex === record.page && record.uuid === recordUUID) {
		// 		decision = true;
		// 	} else {
		// 		decision = false;
		// 	}
		// });
		// return decision;
		// console.log($statements[0].configurations.pageSettings.pagesUUIDs);
		// return $statements[0].configurations.pageSettings.pagesUUIDs;
	}
	// $: ;
	// $: isCurrentTransactionRecordBelongsToThisPage('b606d6f8-18d3-4880-96fa-ab15ec02a3bc');

	// function get$statements[0].configurations.pageSettings.pagesUUIDs(){

	// }

	// $: console.log(
	// 	newTransactions.sort((a, b) => {
	// 		a.bookingDate - b.bookingDate;
	// 	})
	// );

	let startDateElmtIsON = true;
	let endDateElmtIsON = true;

	let myscale = 1;
	let translateX = 0;
	let translateY = 0;

	$: canPanZoom = writable($statements[0].newTransactions.length > 0);

	$: if ($canPanZoom === true) {
	}

	let activeEditorTab = writable('');

	function renderBorders(){
		//initialize border styles when template 3
			// For Row
			$statements[0].configurations.renderBorders.row.all = false;
			$statements[0].configurations.renderBorders.row.top = false;
			$statements[0].configurations.renderBorders.row.bottom = true;
			$statements[0].configurations.renderBorders.row.right = true;
			$statements[0].configurations.renderBorders.row.left = true;

			// For Row Padding
			$statements[0].configurations.rowPadding.top = false;
			$statements[0].configurations.rowPadding.bottom = false;

			// For Cell
			$statements[0].configurations.renderBorders.cell.all = false;
			$statements[0].configurations.renderBorders.cell.top = false;
			$statements[0].configurations.renderBorders.cell.bottom = false;
			$statements[0].configurations.renderBorders.cell.right = true;
			$statements[0].configurations.renderBorders.cell.left = false;
	}

	function removeBorders(){
			$statements[0].configurations.renderBorders.row.bottom = false;
			$statements[0].configurations.renderBorders.row.right = false;
			$statements[0].configurations.renderBorders.row.left = false;

			// For Cell
			$statements[0].configurations.renderBorders.cell.right = false;
	}

	function applyConfiguration(templateStyle){

		if(templateStyle === 1){

			// configure row number 
			$statements[0].configurations.pageSettings.size = 24

			// require dependency
			$statements[0].configurations.columnHeaders.renderRefColumn = true
			$statements[0].configurations.columnHeaders.renderBookingDateColumn = true
			$statements[0].configurations.columnHeaders.renderValueDateColumn = true
			$statements[0].configurations.columnHeaders.renderDescriptionColumn = true
			$statements[0].configurations.columnHeaders.renderInColumn = true
			$statements[0].configurations.columnHeaders.renderOutColumn = true
			$statements[0].configurations.columnHeaders.renderBalanceColumn = true 

			// configure headers
			$statements[0].transactionHeaders.bookingDate.counter = 0	
			$statements[0].transactionHeaders.valueDate.counter = 0	
			$statements[0].transactionHeaders.ref.counter = 0	
			$statements[0].transactionHeaders.description.counter = 0
			$statements[0].transactionHeaders.out.counter = 1	
			$statements[0].transactionHeaders.in.counter = 1	
			$statements[0].transactionHeaders.balance.counter = 0

			// configure bank logo
			$logoUrl = bprBankLogo

		}else if (templateStyle === 2){
			// configure bank logo
			$logoUrl = equityBankLogo

		}else if (templateStyle === 3){

			// configure row number 
			$statements[0].configurations.pageSettings.size = 25

			// configure headers
			$statements[0].transactionHeaders.renderRefColumn = false
			$statements[0].transactionHeaders.renderBookingDateColumn = true
			$statements[0].transactionHeaders.renderValueDateColumn = true
			$statements[0].transactionHeaders.renderDescriptionColumn = true
			$statements[0].transactionHeaders.renderBranchColumn = false
			$statements[0].transactionHeaders.renderOpeColumn = false
			$statements[0].transactionHeaders.renderInColumn = true
			$statements[0].transactionHeaders.renderOutColumn = true
			$statements[0].transactionHeaders.renderBalanceColumn = true

			// configure headers
			$statements[0].transactionHeaders.bookingDate.counter = 4	
			$statements[0].transactionHeaders.valueDate.counter = 0	
			// $statements[0].transactionHeaders.branch.counter = 0	
			// $statements[0].transactionHeaders.ope.counter = 0	
			// $statements[0].transactionHeaders.ref.counter = 3	
			$statements[0].transactionHeaders.description.counter = 3
			$statements[0].transactionHeaders.out.counter = 1	
			$statements[0].transactionHeaders.in.counter = 1	
			$statements[0].transactionHeaders.balance.counter = 0

			// configure bank logo
			$logoUrl = equityBankLogo
		
		}else if (templateStyle === 4){

			// configure row number 
			$statements[0].configurations.pageSettings.size = 24

			// configure headers
			$statements[0].transactionHeaders.renderValueDateColumn = true
			$statements[0].transactionHeaders.renderBookingDateColumn = true
			$statements[0].transactionHeaders.renderBranchColumn = true
			$statements[0].transactionHeaders.renderOpeColumn = true
			$statements[0].transactionHeaders.renderRefColumn = true
			$statements[0].transactionHeaders.renderDescriptionColumn = true
			$statements[0].transactionHeaders.renderOutColumn = true
			$statements[0].transactionHeaders.renderInColumn = true
			$statements[0].transactionHeaders.renderBalanceColumn = true

			// configure headers
			$statements[0].transactionHeaders.bookingDate.counter = 5	
			$statements[0].transactionHeaders.valueDate.counter = 0	
			$statements[0].transactionHeaders.branch.counter = 0	
			$statements[0].transactionHeaders.ope.counter = 0	
			$statements[0].transactionHeaders.ref.counter = 2	
			$statements[0].transactionHeaders.description.counter = 0
			$statements[0].transactionHeaders.out.counter = 1	
			$statements[0].transactionHeaders.in.counter = 1	
			$statements[0].transactionHeaders.balance.counter = 0

			// configure bank logo
			$logoUrl = cogeBankLogo
		
		}else if (templateStyle === 5){
			// configure row number 
			$statements[0].configurations.pageSettings.size = 14 

			// configure headers
			$statements[0].transactionHeaders.renderBookingDateColumn = true
			$statements[0].transactionHeaders.renderRefColumn = true
			$statements[0].transactionHeaders.renderDescriptionColumn = true
			$statements[0].transactionHeaders.renderNarrationColumn = true
			$statements[0].transactionHeaders.renderValueDateColumn = true
			$statements[0].transactionHeaders.renderOutColumn = true
			$statements[0].transactionHeaders.renderInColumn = true
			$statements[0].transactionHeaders.renderBalanceColumn = true

			// configure headers
			$statements[0].transactionHeaders.bookingDate.counter = 2	
			$statements[0].transactionHeaders.ref.counter = 0	
			$statements[0].transactionHeaders.description.counter = 0	
			$statements[0].transactionHeaders.narration.counter = 0	
			$statements[0].transactionHeaders.valueDate.counter = 0	
			$statements[0].transactionHeaders.out.counter = 1	
			$statements[0].transactionHeaders.in.counter = 1	
			$statements[0].transactionHeaders.balance.counter = 0	
			// configure date format
			// configure bank logo
			$logoUrl = BKBankLogo
			// configure theme

		}else if (templateStyle === 6){
			// configure row number 
			$statements[0].configurations.pageSettings.size = 25

			// $statements[0].configurations.renderStartingBalanceRow = false

			// configure headers
			$statements[0].transactionHeaders.renderRefColumn = true
			$statements[0].transactionHeaders.renderDescriptionColumn = true
			$statements[0].transactionHeaders.renderBookingDateColumn = true
			$statements[0].transactionHeaders.renderValueDateColumn = true
			$statements[0].transactionHeaders.renderInColumn = true
			$statements[0].transactionHeaders.renderOutColumn = true
			$statements[0].transactionHeaders.renderBalanceColumn = true

			// configure headers
			$statements[0].transactionHeaders.bookingDate.counter = 1	
			$statements[0].transactionHeaders.valueDate.counter = 0	
			$statements[0].transactionHeaders.description.counter = 2
			$statements[0].transactionHeaders.ref.counter = 3	
			$statements[0].transactionHeaders.out.counter = 1	
			$statements[0].transactionHeaders.in.counter = 1	
			$statements[0].transactionHeaders.balance.counter = 0

			// configure bank logo
			$logoUrl = equityBankLogo	
		}else{}
		
	}
	$: console.log('active theme: ', $activeTheme)
	onMount(() => {
		// Initiate currency
		$selectedCurrencyID = 0;
		$statements[0].accountInfo.currency.value = $selectedCurrencyID;

		// Initiate editor tabs
		const editorStatementTabBtn = document.getElementById('statementTabBtn');
		editorStatementTabBtn.click();
		$activeEditorTab = 'statementTab';

		const canvas = document.getElementById('canvas');

		function updateTransform() {
			//if (canvas !== null) {
			canvas.style.transform = `scale(${myscale}) translate(${translateX}px, ${translateY}px)`;
			//}
		}

		// Function to handle zooming
		function zoom(factor) {
			myscale *= factor;
			updateTransform();
		}

		// Function to handle panning
		function pan(dx, dy) {
			translateX += dx;
			translateY += dy;
			updateTransform();
		}

		// Add event listeners for zooming and panning (you can customize these)
		// canvas?.addEventListener('wheel', (event) => {
		// 	if (event.deltaY > 0) {
		// 		zoom(0.99); // Zoom out
		// 	} else {
		// 		zoom(1.09); // Zoom in
		// 	}
		// });

		let insideCanvas = false 

		// Example panning with arrow keys
		canvas?.addEventListener('mouseenter', (event) => {
			insideCanvas = true
			// console.log(event)
		});
		canvas?.addEventListener('mouseleave', (event) => {
			insideCanvas = false
			// console.log(event)
		});

		window.addEventListener('keydown', (event) => {

			if (event.key === 'ArrowLeft') {
				insideCanvas && pan(50, 0);
			} else if (event.key === 'ArrowRight') {
				insideCanvas && pan(-50, 0);
			} else if (event.key === 'ArrowUp') {
				insideCanvas && pan(0, 50);
			} else if (event.key === 'ArrowDown') {
				insideCanvas && pan(0, -50);
			}

		})

		// Initialize the initial transform
		//if (canvas !== null) {
		updateTransform();
		//}

		$statements[0].newTransactions = [];

		// initialize dates
		$statements[0].duration.dateRanges.dateDraftColection.forEach((record, index) => {
			if (index < $statements[0].newTransactions.length) {
				$statements[0].newTransactions[index].date = format(new Date(record), 'yyyy-MM-dd');
				$statements[0].newTransactions[index].bookingDate = format(new Date(record), 'yyyy-MM-dd');
				$statements[0].newTransactions[index].valueDate = format(new Date(record), 'yyyy-MM-dd');
			}
		});


		if( $displayHeaderChoice === 1){
			removeBorders();
			applyConfiguration($displayHeaderChoice)

		}else if($displayHeaderChoice === 2){
			removeBorders();
			applyConfiguration($displayHeaderChoice)

		}else if($displayHeaderChoice === 3){
			//initialize border styles when template 3
			renderBorders()
			applyConfiguration($displayHeaderChoice)
		
		}else if($displayHeaderChoice === 4){
			removeBorders();
			applyConfiguration($displayHeaderChoice)
			
		}else if($displayHeaderChoice === 5){
			removeBorders();
			applyConfiguration($displayHeaderChoice)
			$statements[0].configurations.columnHeaders.renderNarrationColumn = true

		}else if($displayHeaderChoice === 6){
			renderBorders()
			applyConfiguration($displayHeaderChoice)
			
		}else{
			$statements[0].configurations.columnHeaders.renderNarrationColumn = false

			// ===================================
			//initialize border styles when not template 3 
			// For Row

		}


		executeRandomizeDateRange();
		// console.log($statements);
		// console.log($statements[0].configurations.pageSettings.pages[0][0].uuid);
		// isCurrentTransactionRecordBelongsToThisPage('b606d6f8-18d3-4880-96fa-ab15ec02a3bc');
		// identifierField = document.getElementById('showmore-field').click();

		// console.log(format(new Date(), 'EEE, d MMM yyyy'));

		intervalID = setInterval(() => {
			// console.log($statements[0]);
			time = lightFormat(new Date(Date.now()), 'HH:mm:ss');
			// $statements[0].duration.time.value = time;
		}, 1000);
	});
	onDestroy(() => {
		clearInterval(intervalID);
		// identifierField = document.getElementById('showmore-field').click();
	});
</script>

<main class="w-screen h-screen bg-white flex flex-no-wrap test:relative">
	<section
		class=" test: sr-only z-50 absolute top-0 left-0 flex-shrink-0 shadow-sm test:bg-[#0e0e0e] bg-[#131e1e] test:bg-gray-100 border-r border-solid border-black/5 py-10 !w-[55px] h-full"
	/>
	<section
		class=" test: sr-only z-50 absolute top-0 left-0 flex-shrink-0 shadow-sm test:bg-[#0b0b0b] bg-[#f7f7f7] test:bg-gray-100 border-r border-solid border-black/5 py-10 !w-[230px] !ml-[55px] h-full"
	/>
	<!-- ! #111111 -->
	<section class="w-full h-full relative flex-1">
		<div
			class="absolute inset-0 z-20 flex justify-center items-center w-full h-full bg-[#f3f3f3]
		{$statements[0].newTransactions.length > 0
				? ' opacity-0 pointer-events-none'
				: 'pointer-events-auto opacity-100 '}
		transition duration-700 ease-in-out
		"
		>
			<div class="flex flex-col w-1/2 min-h-1/2 space-y-6">
				<div class=" relative w-full h-[300px] flex justify-center items-center">
					<!-- doc -->
					<svg class="w-[300px] h-[300px] blur-3xl mix-blend-overlay" viewBox="0 0 64 64">
						<path
							fill="#faefde"
							d="M23.24,4.94H52a3,3,0,0,1,3,3v48a3,3,0,0,1-3,3H14a3,3,0,0,1-3-3V17.18a3,3,0,0,1,.88-2.12l9.24-9.24A3,3,0,0,1,23.24,4.94Z"
						/>
						<path
							fill="#fff7f0"
							d="M11 59L10.85 49.54 54.34 6.06 55 29 25 59 11 59zM10.85 39.15L45.06 4.94 50.81 5.19 11 45 10.85 39.15zM10.85 33.15L39 5 42 5 10.85 36.15 10.85 33.15z"
						/>
						<path
							fill="#fff"
							d="M45.5 13L46.74 15.26 49 16.5 46.74 17.74 45.5 20 44.26 17.74 42 16.5 44.26 15.26 45.5 13zM30.42 11L31.27 12.56 32.84 13.42 31.27 14.27 30.42 15.84 29.56 14.27 28 13.42 29.56 12.56 30.42 11zM16.65 42L17.23 43.06 18.3 43.65 17.23 44.23 16.65 45.3 16.07 44.23 15 43.65 16.07 43.06 16.65 42z"
						/>
						<path fill="#bbdef9" d="M23 5L23 17 11 17 23 5z" />
						<path
							fill="#8d6c9f"
							d="M53,4H23.66a5,5,0,0,0-3.54,1.46l-8.66,8.66A5,5,0,0,0,10,17.66V57a3,3,0,0,0,3,3H53a3,3,0,0,0,3-3V7A3,3,0,0,0,53,4ZM21.54,6.88A3,3,0,0,1,22,6.5V15a1,1,0,0,1-1,1H12.5a3,3,0,0,1,.38-.46ZM54,57a1,1,0,0,1-1,1H13a1,1,0,0,1-1-1V18h9a3,3,0,0,0,3-3V6H53a1,1,0,0,1,1,1Z"
						/>
						<path
							fill="#8d6c9f"
							d="M45 22H41a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2zM21 24H37a1 1 0 0 0 0-2H21a1 1 0 0 0 0 2zM21 28H41a1 1 0 0 0 0-2H21a1 1 0 0 0 0 2zM33 36H21a1 1 0 0 0 0 2H33a1 1 0 0 0 0-2zM43 32H21a1 1 0 0 0 0 2H43a1 1 0 0 0 0-2zM15 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 15 50zM20 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 20 50zM25 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 25 50zM30 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 30 50zM35 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 35 50zM40 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 40 50zM45 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 45 50zM50 50a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V51A1 1 0 0 0 50 50z"
						/>
					</svg>

					<!-- doc:1 -->
					<svg
						class="w-[250px] h-[250px] stroke-1 opacity-5 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
						viewBox="0 0 64 64"
					>
						<path
							d="M23.65625 4C22.320313 4 21.066406 4.519531 20.121094 5.464844L11.464844 14.121094C10.519531 15.066406 10 16.320313 10 17.65625L10 57C10 58.652344 11.347656 60 13 60L53 60C54.652344 60 56 58.652344 56 57L56 7C56 5.347656 54.652344 4 53 4 Z M 24 6L53 6C53.550781 6 54 6.449219 54 7L54 57C54 57.550781 53.550781 58 53 58L13 58C12.449219 58 12 57.550781 12 57L12 18L21 18C22.652344 18 24 16.652344 24 15 Z M 22 6.5L22 15C22 15.550781 21.550781 16 21 16L12.5 16C12.605469 15.835938 12.734375 15.679688 12.878906 15.535156L21.535156 6.878906C21.679688 6.738281 21.835938 6.613281 22 6.5 Z M 21 22C20.449219 22 20 22.449219 20 23C20 23.550781 20.449219 24 21 24L37 24C37.550781 24 38 23.550781 38 23C38 22.449219 37.550781 22 37 22 Z M 41 22C40.449219 22 40 22.449219 40 23C40 23.550781 40.449219 24 41 24L45 24C45.550781 24 46 23.550781 46 23C46 22.449219 45.550781 22 45 22 Z M 21 26C20.449219 26 20 26.449219 20 27C20 27.550781 20.449219 28 21 28L41 28C41.550781 28 42 27.550781 42 27C42 26.449219 41.550781 26 41 26 Z M 21 32C20.449219 32 20 32.449219 20 33C20 33.550781 20.449219 34 21 34L43 34C43.550781 34 44 33.550781 44 33C44 32.449219 43.550781 32 43 32 Z M 21 36C20.449219 36 20 36.449219 20 37C20 37.550781 20.449219 38 21 38L33 38C33.550781 38 34 37.550781 34 37C34 36.449219 33.550781 36 33 36 Z M 15 50C14.449219 50 14 50.449219 14 51L14 53C14 53.550781 14.449219 54 15 54C15.550781 54 16 53.550781 16 53L16 51C16 50.449219 15.550781 50 15 50 Z M 20 50C19.449219 50 19 50.449219 19 51L19 53C19 53.550781 19.449219 54 20 54C20.550781 54 21 53.550781 21 53L21 51C21 50.449219 20.550781 50 20 50 Z M 25 50C24.449219 50 24 50.449219 24 51L24 53C24 53.550781 24.449219 54 25 54C25.550781 54 26 53.550781 26 53L26 51C26 50.449219 25.550781 50 25 50 Z M 30 50C29.449219 50 29 50.449219 29 51L29 53C29 53.550781 29.449219 54 30 54C30.550781 54 31 53.550781 31 53L31 51C31 50.449219 30.550781 50 30 50 Z M 35 50C34.449219 50 34 50.449219 34 51L34 53C34 53.550781 34.449219 54 35 54C35.550781 54 36 53.550781 36 53L36 51C36 50.449219 35.550781 50 35 50 Z M 40 50C39.449219 50 39 50.449219 39 51L39 53C39 53.550781 39.449219 54 40 54C40.550781 54 41 53.550781 41 53L41 51C41 50.449219 40.550781 50 40 50 Z M 45 50C44.449219 50 44 50.449219 44 51L44 53C44 53.550781 44.449219 54 45 54C45.550781 54 46 53.550781 46 53L46 51C46 50.449219 45.550781 50 45 50 Z M 50 50C49.449219 50 49 50.449219 49 51L49 53C49 53.550781 49.449219 54 50 54C50.550781 54 51 53.550781 51 53L51 51C51 50.449219 50.550781 50 50 50Z"
							fill="#3B3B3B"
						/>
					</svg>
				</div>
				<div class=" w-full h-fit">
					<div class="flex flex-col items-center w-full space-y-0 mb-3">
						<h2
							class="text-center font-semibold text-3xl bg-gradient-to-tr from-slate-600 to-slate-400 text-transparent bg-clip-text"
						>
							No transactions yet!
						</h2>
						<span class="font-normal text-xs leading-4 max-w-[60ch] text-center text-slate-700/50">
							<!-- Creating or adding new transactions can be achieved by two options:  -->
							Clicking add new transaction button will add transaction manually while From template will
							generate transactions from random seeds
						</span>
					</div>
				</div>
				<div class=" w-full h-fit flex justify-center items-center space-x-4">
					<button
						type="button"
						on:click={() => {
							const addNewRecordButton = document.getElementById('addNewRecordButton');
							$createNewTransactionsFrom === 'FRESH_CREATION';
							addNewRecordButton.click();
						}}
						class="py-2 px-4 bg-gradient-to-tr from-amber-600 to-amber-400 text-white text-sm font-normal rounded-md"
					>
						New Record
					</button>
					<button
						type="button"
						on:click={() => {
							// const addNewRecordButtonSeed = document.getElementById('addNewRecordButtonSeed');
							const transactionCopy = $statements[0].transactions;
							const datesRange = $statements[0].duration.dateRanges.dateDraftColection;
							let requestedSeedCount = 25;

							$createNewTransactionsFrom = 'RANDOM_SEEDS';

							// let newTransactionRecordsSeedsCollection = [];
							// isSizeSeedable =
							async function seedNewTransactions(seedCount, datesRange, transactionCopy) {
								// console.log(`Seeding ${seedCount} new transactions`);

								let newTransactionSeeds = [];
								for (let i = 1; i <= seedCount; i++) {
									const transactionSeed = {
										dataManipulationConfig: {
											isEditRecordRestricted: transactionCopy[i].isEditRecordRestricted,
											isDeleteRecordRestricted: transactionCopy[i].isDeleteRecordRestricted,
											isCopyRecordRestricted: transactionCopy[i].isCopyRecordRestricted,
											isRandomizeRecordDatesRestricted:
												transactionCopy[i].isRandomizeRecordDatesRestricted,
											isRecordDuplicationRestricted:
												transactionCopy[i].isRecordDuplicationRestricted
										},
										uuid: crypto.randomUUID(),
										ref: transactionCopy[i].ref,
										date: datesRange[i],
										bookingDate: datesRange[i],
										valueDate: datesRange[i],
										branch: transactionCopy[i].branch,
										ope: transactionCopy[i].ope,
										narration: transactionCopy[i].narration,

										description: transactionCopy[i].description,
										more: transactionCopy[i].more,
										type: transactionCopy[i].type,
										amount: transactionCopy[i].amount,
										balance: 0.0
									};

									newTransactionSeeds.push(transactionSeed);
								}

								return newTransactionSeeds;
							}

							if (typeof requestedSeedCount !== 'number') {
								alert('Seeding items failed, try again.');
								return;
							} else {
								if (requestedSeedCount > transactionCopy.length) {
									alert('Maximum seedable range is from 1 to 25 items');
									return;
								} else if (requestedSeedCount < 1) {
									alert('You should at least seed one item');
									return;
								} else if (requestedSeedCount <= transactionCopy.length) {
									seedNewTransactions(requestedSeedCount, datesRange, transactionCopy).then(
										(newTransactionSeeds) => {
											// console.log(`Seeded ${newTransactionSeeds.length} new transactions`);
											// console.log(`Loading transactions...`);

											computeTransactions(newTransactionSeeds);
										}
									);
								} else {
									alert('Something is not right, try again.');
									return;
								}
							}
						}}
						class="py-2 px-4 bg-gradient-to-tr from-amber-600 to-amber-400 text-white text-sm font-normal rounded-md"
					>
						From Template
					</button>
				</div>
			</div>
		</div>

		<div
			id="viewport"
			style="background-color: rgb(237 237 237); "
			class="px-10 canvas:container z-10 absolute inset-0 overflow-auto test:w-[81%] w-full screen h-screen transition-all duration-300 ease-out scrollbar scrollbar !scrollbar-rounded-full scrollbar-thumb-[#fbfbfb] scrollbar-track-[rgb(237 237 237)] !scroll-smooth" 
		>
			<section
				id="canvas"
				class="  flex-1 flex flex-col justify-start items-center test:bg-gray-50/10 test:bg-[#0e0e0e] py-10 h-fit test:min-w-screen w-fit overflow-visible transition-all duration-300 ease-out"
			>
				{#if $statements[0].newTransactions.length > 0}
					<!-- {#await initiateSetDates()}
					<span class="text-yellow-600 font-bold text-2xl">Waiting a promise...</span>
				{:then newRange} -->
					<!-- {#if canShowCanvas === true} -->

					{#each $statements[0].configurations.pageSettings.pages as page, pageIndex}
						<!-- ? style="scale: {$zoomLevel ?? 0.9}; margin-top: {450 * $zoomLevel}px;" -->
						<!-- ? class="border border-black/50 border-solid flex flex-col justify-start items-center bg-white shadow-xl test:w-[210mm] test:h-[297mm] w-[420mm] h-[297mm] ml-[15px] mr-[175px] test:ml-[250px] test:mr-[170px] {transition}" -->
						<div
							id={`page_${pageIndex}`}
							style="width: 1191px; height: 1684px; padding: 72px"
							class="aspect-w-auto aspect-h-auto border border-black/5 rounded-sm border-solid flex flex-col flex-shrink-0 justify-between items-center bg-white shadow-xl object-center object-cover
							{$statements[0].newTransactions.length > 0
								? 'opacity-100 scale-100'
								: 'opacity-0 scale-0 '} transition-all duration-300 ease-out"
						>
							<div class="w-full h-fit">
								{#if $displayHeaderChoice === 3}
									<section class="flex justify-end items-center">
										<h2 class="doc:pages text-xs">
											<span class="">{pageIndex + 1}</span>
											<span class="">/</span>
											<!-- <span class="opacity-90"> of </span> -->
											<span class="opacity-90"
												>{$statements[0].configurations.pageSettings.pages.length}</span
											>
											<!-- <span class="opacity-90"
												> Pages</span
											> -->
										</h2>
									</section>
									<section class="flex items-center pl-3 py-3">
										<div
											style="background-image: url({$logoUrl || ''});"
											class="logo:image rounded-md bg-no-repeat bg-contain bg-center overflow-hidden border-solid border-[0.006em] border-slate-100/90
													{$isShowingLogoImage === true
												? 'scale-100 opacity-100 w-[50px] h-[50px]'
												: 'w-[0px] h-[0px] scale-0 opacity-0'} {transition} origin-center"
										>
											{#if $logoUrl === ''}
												{#key $logoUrl}
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 48 48"
														class="w-full h-full"
													>
														<linearGradient
															id="imCJKIfzwKtpBeBobeWKRa"
															x1="18.766"
															x2="27.561"
															y1="1.896"
															y2="42.938"
															gradientUnits="userSpaceOnUse"
														>
															<stop offset="0" stop-color="#21ad64" />
															<stop offset="1" stop-color="#088242" />
														</linearGradient>
														<path
															fill="url(#imCJKIfzwKtpBeBobeWKRa)"
															d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
														/>
														<path
															d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
															opacity=".05"
														/>
														<path
															d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
															opacity=".07"
														/>
														<path
															fill="#fff"
															d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
														/>
													</svg>
												{/key}
											{/if}
										</div>
									</section>
									<section class="">
										<table
											class="table-auto flex w-[100%] mb-10 font-semibold text-sm border-b-2 border-b-black/60 border-b-solid"
										>
											<tbody class="flex justify-between max-h-fit">
												<tr class=" flex flex-col">
													<td class="font-base text-xs pb-3">
														HEAD OFFICE: {$statements[0].bankInfo.poBox.value}, Tel: {$statements[0]
															.bankInfo.call.office.value}
														Fax: {$statements[0].bankInfo.fax.value}, Mobile: {$statements[0]
															.bankInfo.call.mobile.value}, Email: {$statements[0].bankInfo.email
															.value}, Website: {$statements[0].bankInfo.website.value}
													</td>
												</tr>
											</tbody>
										</table>
									</section>
								{/if}
								{#if $displayHeaderChoice === 5}
									<section class="flex flex-col iems-center w-full">
										<section class="flex items-center mb-5">
											<div
												style="background-image: url({$logoUrl || ''});"
												class="logo:image bg-no-repeat bg-contain bg-left overflow-hidden
														{$isShowingLogoImage === true
													? 'scale-100 opacity-100 w-full h-[80px]'
													: 'w-[0px] h-[0px] scale-0 opacity-0'} {transition} origin-left"
											>
												{#if $logoUrl === ''}
													{#key $logoUrl}
														<svg
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 48 48"
															class="w-full h-full"
														>
															<linearGradient
																id="imCJKIfzwKtpBeBobeWKRa"
																x1="18.766"
																x2="27.561"
																y1="1.896"
																y2="42.938"
																gradientUnits="userSpaceOnUse"
															>
																<stop offset="0" stop-color="#21ad64" />
																<stop offset="1" stop-color="#088242" />
															</linearGradient>
															<path
																fill="url(#imCJKIfzwKtpBeBobeWKRa)"
																d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
															/>
															<path
																d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
																opacity=".05"
															/>
															<path
																d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
																opacity=".07"
															/>
															<path
																fill="#fff"
																d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
															/>
														</svg>
													{/key}
												{/if}
											</div>
										</section>
									</section>
									<section
										class=" flex flex-col justify-center items-end py-3 h-fit w-full text-black/60"
									>
										
										<h2 class=" font-semibold text-sm">
											<span class="opacity-100">{format(
																new Date($statements[0].duration.dueDate.value),
																$statements[0].duration.dueDate.formats[4]
															)}</span>
										</h2>
										<h2 class=" font-semibold text-sm">
											{time}
										</h2>
										<!-- {$statements[0].footer.bankOfficer.label}: {$statements[0].footer.bankOfficer.value} -->
									</section>

								{/if}
								{#if $displayHeaderChoice === 6}
									<section class="flex justify-end items-center">
										<h2 class="doc:pages text-xs">
											<span class="">{pageIndex + 1}</span>
											<span class="">/</span>
											<!-- <span class="opacity-90"> of </span> -->
											<span class="opacity-90"
												>{$statements[0].configurations.pageSettings.pages.length}</span
											>
											<!-- <span class="opacity-90"
												> Pages</span
											> -->
										</h2>
									</section>
									<section class="flex items-center pl-3 py-3">
										<div
											style="background-image: url({$logoUrl || ''});"
											class="logo:image rounded-md bg-no-repeat bg-contain bg-center overflow-hidden border-solid border-[0.006em] border-slate-100/90
													{$isShowingLogoImage === true
												? 'scale-100 opacity-100 w-[50px] h-[50px]'
												: 'w-[0px] h-[0px] scale-0 opacity-0'} {transition} origin-center"
										>
											{#if $logoUrl === ''}
												{#key $logoUrl}
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 48 48"
														class="w-full h-full"
													>
														<linearGradient
															id="imCJKIfzwKtpBeBobeWKRa"
															x1="18.766"
															x2="27.561"
															y1="1.896"
															y2="42.938"
															gradientUnits="userSpaceOnUse"
														>
															<stop offset="0" stop-color="#21ad64" />
															<stop offset="1" stop-color="#088242" />
														</linearGradient>
														<path
															fill="url(#imCJKIfzwKtpBeBobeWKRa)"
															d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
														/>
														<path
															d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
															opacity=".05"
														/>
														<path
															d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
															opacity=".07"
														/>
														<path
															fill="#fff"
															d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
														/>
													</svg>
												{/key}
											{/if}
										</div>
									</section>
									<section class="">
										<table
											class="table-auto flex w-[100%] mb-10 font-semibold text-sm border-b-2 border-b-black/60 border-b-solid"
										>
											<tbody class="flex justify-between max-h-fit">
												<tr class=" flex flex-col">
													<td class="font-base text-xs pb-3">
														HEAD OFFICE: {$statements[0].bankInfo.poBox.value}, Tel: {$statements[0]
															.bankInfo.call.office.value}
														Fax: {$statements[0].bankInfo.fax.value}, Mobile: {$statements[0]
															.bankInfo.call.mobile.value}, Email: {$statements[0].bankInfo.email
															.value}, Website: {$statements[0].bankInfo.website.value}
													</td>
												</tr>
											</tbody>
										</table>
									</section>
								{/if}	

								{#if pageIndex === 0}
									<!-- ? Deal with template switching -->
									{#if $displayHeaderChoice === 1}
									<!-- {$documentThemes[$activeTheme].bgFromEven} -->
										<section
											class="Bank:address w-full h-fit test:p-8 py-8 flex flex-col"
										>
											<div class="flex flex-row-reverse justify-between space-x-3 items-center">
												<div
													style="background-image: url({$logoUrl || ''});"
													class="logo:image bg-no-repeat bg-contain bg-right overflow-hidden 
													{$isShowingLogoImage === true
														? 'scale-100 opacity-100 flex-1 w-auto h-[150px]'
														: 'w-[0px] h-[0px] scale-0 opacity-0'} {transition} origin-center"
												>
													{#if $logoUrl === ''}
														{#key $logoUrl}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 48 48"
																class="w-full h-full"
															>
																<linearGradient
																	id="imCJKIfzwKtpBeBobeWKRa"
																	x1="18.766"
																	x2="27.561"
																	y1="1.896"
																	y2="42.938"
																	gradientUnits="userSpaceOnUse"
																>
																	<stop offset="0" stop-color="#21ad64" />
																	<stop offset="1" stop-color="#088242" />
																</linearGradient>
																<path
																	fill="url(#imCJKIfzwKtpBeBobeWKRa)"
																	d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
																/>
																<path
																	d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
																	opacity=".05"
																/>
																<path
																	d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
																	opacity=".07"
																/>
																<path
																	fill="#fff"
																	d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
																/>
															</svg>
														{/key}
													{/if}
												</div>
												<div class="w-[65%]">
													<table class="table-auto w-[50%] font-semibold text-sm">
														<tbody class="flex justify-between">
															<tr class=" flex flex-col">
																<td class="">{$statements[0].bankInfo.name.value}</td>
																<td class="">{$statements[0].bankInfo.street.value}</td>
																<td class=""
																	>{$statements[0].bankInfo.poBox.value}, {$statements[0].bankInfo
																		.city.value}, {$statements[0].bankInfo.capital.value}</td
																>
																<td class=""
																	>Office Line: {$statements[0].bankInfo.call.office.value}</td
																>
																<td class=""
																	>Call Center: {$statements[0].bankInfo.call.center.value}</td
																>
																<td class="">Email: {$statements[0].bankInfo.email.value}</td>
																<td class="">Website: {$statements[0].bankInfo.website.value}</td>
															</tr>
														</tbody>
													</table>
												</div>
											</div>
										</section>
										<section
											class="Account:Info w-full h-auto flex justify-between test:px-8 py-10 text-black/60"
										>
											<table class="table-auto w-[40%] font-semibold text-sm">
												<tbody class="flex justify-between">
													<tr class=" flex flex-col">
														<td class="">Account Name:</td>
														<td class="">Account Number:</td>
														<td class="">Account Currency:</td>
														<td class="">Branch Name:</td>
														<td class="">Start Period:</td>
														<td class="">End Period:</td>
													</tr>
													<tr class=" flex flex-col">
														<td class="">{$statements[0].accountInfo.name.value}</td>
														<td class="">{$statements[0].accountInfo.number.value}</td>
														<td class=""
															>{$currencies[$statements[0].accountInfo.currency.value].label}</td
														>
														<td class="">{$statements[0].accountInfo.branch.name.value}</td>
														<td class=""
															>{lightFormat(
																new Date($statements[0].duration.start.value),
																'yyyy/MM/dd'
															)}</td
														>
														<td class=""
															>{lightFormat(
																new Date($statements[0].duration.end.value),
																'yyyy/MM/dd'
															)}</td
														>
													</tr>
												</tbody>
											</table>
											<table class="table-auto w-[30%] font-semibold text-sm">
												<tbody class="flex justify-between">
													<tr class=" flex flex-col">
														<td class="">Date:</td>
														<td class="">Time:</td>
														<td class="">Opening Balance:</td>
														<td class="">Total Debits:</td>
														<td class="">Total Credits:</td>
														<td class="">Closing Balance:</td>
													</tr>
													<tr class=" flex flex-col">
														<td class=""
															>{format(
																new Date($statements[0].duration.dueDate.value),
																$statements[0].duration.dueDate.formats[0]
															)}</td
														>
														<td class="">{time}</td>
														<td class=""
															>{$previousBalance !== null
																? formatAmount(
																		$previousBalance,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</td
														>
														<td class=""
															>{$totalBalanceIn !== null
																? formatAmount(
																		$totalBalanceIn,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</td
														>
														<td class=""
															>{$totalBalanceOut !== null
																? formatAmount(
																		$totalBalanceOut,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</td
														>
														<td class=""
															>{$previousRowBalance !== null
																? formatAmount(
																		$previousRowBalance,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</td
														>
													</tr>
												</tbody>
											</table>
										</section>
									{:else if $displayHeaderChoice === 2}
										<section
											class="Bank:address {$documentThemes[$activeTheme]
												.bgFromEven} w-full h-auto px-8 py-10 flex flex-col"
										>
											<div class="flex space-x-3 items-center">
												<div
													style="background-image: url({$logoUrl || ''});"
													class="logo:image rounded-md bg-no-repeat bg-contain bg-center overflow-hidden border-solid border-[0.006em] border-slate-100/90
													{$isShowingLogoImage === true
														? 'scale-100 opacity-100 w-[100px] h-[100px]'
														: 'w-[0px] h-[0px] scale-0 opacity-0'} {transition} origin-center"
												>
													{#if $logoUrl === ''}
														{#key $logoUrl}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 48 48"
																class="w-full h-full"
															>
																<linearGradient
																	id="imCJKIfzwKtpBeBobeWKRa"
																	x1="18.766"
																	x2="27.561"
																	y1="1.896"
																	y2="42.938"
																	gradientUnits="userSpaceOnUse"
																>
																	<stop offset="0" stop-color="#21ad64" />
																	<stop offset="1" stop-color="#088242" />
																</linearGradient>
																<path
																	fill="url(#imCJKIfzwKtpBeBobeWKRa)"
																	d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
																/>
																<path
																	d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
																	opacity=".05"
																/>
																<path
																	d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
																	opacity=".07"
																/>
																<path
																	fill="#fff"
																	d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
																/>
															</svg>
														{/key}
													{/if}
												</div>
												<div class="">
													<div class="logo:title">
														<h2
															class="{$documentThemes[$activeTheme]
																.primaryActiveText} font-semibold text-4xl"
														>
															{$statements[0].bankInfo.name.value}
															<!-- <span class="font-light"> BANK, LLC.</span> -->
														</h2>
													</div>
													<div class="address font-semibold text-sm text-black/60 mt-2">
														<h2 class="">{$statements[0].bankInfo.street.value}, {$statements[0].bankInfo.capital.value} {$statements[0].bankInfo
																		.city.value}</h2>
														<h2 class="">{$statements[0].bankInfo.call.office.value}</h2>
													</div>
												</div>
											</div>
										</section>

										<section
											class="account:summary {$documentThemes[$activeTheme]
												.bgFromEven} w-full px-6 h-[15%] flex justify-around items-center"
										>
											<AccountSummaryComponent
												bgFromEven={$documentThemes[$activeTheme].bgFromEven}
												primaryActiveText={$documentThemes[$activeTheme].primaryActiveText}
												amount={$previousBalance !== null
													? formatAmount($previousBalance, 'currency', 'RWF', 'rw-RW')
													: formatAmount()}
												desc="Starting Balance"
												explain="Opening balance amount"
											/>
											<AccountSummaryComponent
												bgFromEven={$documentThemes[$activeTheme].bgFromEven}
												primaryActiveText={$documentThemes[$activeTheme].primaryActiveText}
												amount={$totalBalanceIn !== null
													? formatAmount($totalBalanceIn)
													: formatAmount()}
												desc="Total money in"
												explain="Opening balance amount"
											/>
											<AccountSummaryComponent
												bgFromEven={$documentThemes[$activeTheme].bgFromEven}
												primaryActiveText={$documentThemes[$activeTheme].primaryActiveText}
												amount={$totalBalanceOut !== null
													? formatAmount($totalBalanceOut)
													: formatAmount()}
												desc="Total money out"
												explain="Opening balance amount"
											/>
											<AccountSummaryComponent
												bgFromEven={$documentThemes[$activeTheme].bgFromEven}
												primaryActiveText={$documentThemes[$activeTheme].primaryActiveText}
												amount={$previousRowBalance !== null
													? formatAmount($previousRowBalance)
													: formatAmount()}
												desc="Ending Balance"
												explain="Opening balance amount"
											/>
										</section>
									{:else if $displayHeaderChoice === 3}
										<section class="flex flex-col relative">
											<h2 class="absolute text-black/60 font-semibold text-center top-2 left-0">
												To,
											</h2>
											<div class="w-full h-auto flex space-x-32 py-10 text-black/60">
												<table
													class="table-auto flex w-[30%] font-semibold text-sm border-2 border-black/60 border-solid"
												>
													<tbody class="flex justify-between max-h-fit">
														<tr class=" flex flex-col p-2">
															<td class="font-bold">{$statements[0].accountInfo.name.value}</td>
															<td class="font-bold">{$statements[0].bankInfo.city.value}</td>
															<td class="font-bold">{$statements[0].bankInfo.capital.value}</td>
															<td class="font-bold"
																>{$currencies[$statements[0].accountInfo.currency.value]
																	.currency}</td
															>
															<td class="font-bold">{$statements[0].accountInfo.number.value}</td>
														</tr>
														<!-- <td class=""
															>{lightFormat(
																new Date($statements[0].duration.start.value),
																'yyyy/MM/dd'
															)}</td
														>
														<td class=""
															>{lightFormat(
																new Date($statements[0].duration.end.value),
																'yyyy/MM/dd'
															)}</td
														> -->
													</tbody>
												</table>
												<table class="table-auto w-[30%] font-semibold text-sm">
													<tbody class="flex justify-between p-2">
														<tr class=" flex flex-col">
															<td class="font-bold">Branch ID</td>
															<td class="font-bold">Customer Name</td>
															<td class="font-bold">Product Name</td>
															<td class="font-bold">Currency</td>
															<!-- <td class="">Total Credits:</td>
															<td class="">Closing Balance:</td> -->
														</tr>
														<tr class=" flex flex-col">
															<td class="font-bold"
																>: {$statements[0].accountInfo.branch.id.value}</td
															>
															<td class="font-bold"
																>: {$statements[0].accountInfo.customer.name.value}</td
															>
															<td class="font-bold"
																>: {$statements[0].accountInfo.product.name.value}</td
															>
															<td class="font-bold"
																>: {$currencies[$statements[0].accountInfo.currency.value]
																	.currency}</td
															>
															<!-- <td class=""
																>USD {$totalBalanceOut !== null
																	? formatAmount($totalBalanceOut)
																	: formatAmount()}</td
															>
															<td class=""
																>USD {$previousRowBalance !== null
																	? formatAmount($previousRowBalance)
																	: formatAmount()}</td
															> -->
														</tr>
													</tbody>
												</table>
											</div>
											<div class="mb-5">
												<h2 class="text-black/60 text-center font-bold">
													{$statements[0].title.value}
													{$statements[0].id.value}
												</h2>
												<h3 class="text-black/50 text-center font-semibold">
													Statement Period (From <span class="text-black/60"
														>{format(
															new Date($statements[0].duration.start.value),
															'dd-MM-yyyy'
														)}</span
													>
													&nbsp;&nbsp; To
													<span class="text-black/60"
														>{format(
															new Date($statements[0].duration.end.value),
															'dd-MM-yyyy'
														)}</span
													>)
												</h3>
											</div>
										</section>
									{:else if $displayHeaderChoice === 4}
										<section class="flex flex-col iems-center w-full">
											<section class="flex items-center mb-5">
												<div
													style="background-image: url({$logoUrl || ''});"
													class="logo:image bg-no-repeat bg-contain bg-left overflow-hidden
															{$isShowingLogoImage === true
														? 'scale-100 opacity-100 w-full h-[150px]'
														: 'w-[0px] h-[0px] scale-0 opacity-0'} {transition} origin-left"
												>
													{#if $logoUrl === ''}
														{#key $logoUrl}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 48 48"
																class="w-full h-full"
															>
																<linearGradient
																	id="imCJKIfzwKtpBeBobeWKRa"
																	x1="18.766"
																	x2="27.561"
																	y1="1.896"
																	y2="42.938"
																	gradientUnits="userSpaceOnUse"
																>
																	<stop offset="0" stop-color="#21ad64" />
																	<stop offset="1" stop-color="#088242" />
																</linearGradient>
																<path
																	fill="url(#imCJKIfzwKtpBeBobeWKRa)"
																	d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
																/>
																<path
																	d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
																	opacity=".05"
																/>
																<path
																	d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
																	opacity=".07"
																/>
																<path
																	fill="#fff"
																	d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
																/>
															</svg>
														{/key}
													{/if}
												</div>
											</section>
											<div class="flex justify-center items-center mb-12 w-full h-14 border-2 border-black/50">
												<h2 class="font-bold text-xl">{$statements[0].title.value.toUpperCase()}</h2>
											</div>
											<div class="flex justify-between items-center w-full h-fit">
												<div class="flex justify-between items-center w-[60%] h-fit border-[1px] border-black/50 ">
													<!-- <h2 class="font-bold text-xl">{$statements[0].title.value.toUpperCase()}</h2> -->
													
														<section class="flex justify-between divide-x-[1px] divide-black/70 w-full">
															<div class=" flex flex-col w-[30%] justify-end divide-y-[1px] divide-black/70">
																<div class="font-normal w-full h-10 flex justify-end items-center px-3">Account Name</div>
																<div class="font-normal w-full h-10 flex justify-end items-center px-3">Account# / Currency</div>
																<div class="font-normal w-full h-10 flex justify-end items-center px-3">Account Type</div>
																<div class="font-normal w-full h-10 flex justify-end items-center px-3">Address</div>
																<!-- <div class="">Total Credits:</div>
																<div class="">Closing Balance:</div> -->
															</div>
															<div class=" flex flex-col w-[70%] divide-y-[1px] divide-black/70">
																<div class="font-bold w-full h-10 flex justify-start items-center px-3"
																	> {$statements[0].accountInfo.name.value}</div
																>
																<div class="font-bold w-full h-10 flex justify-start items-center px-3"
																	> {$statements[0].accountInfo.number.value} / {$currencies[$statements[0].accountInfo.currency.value]
																		.currency}</div
																>
																<div class="font-bold w-full h-10 flex justify-start items-center px-3"
																	> {$statements[0].accountInfo.accountType.value}</div
																>
																<div class="font-bold w-full h-10 flex justify-start items-center px-3"
																	> {$statements[0].bankInfo.address.value}</div
																>

															</div>
														</section>
													
												</div>
												<div class="flex justify-between items-center w-[40%] h-fit border-[1px] border-black/50 ">
													<section class="flex justify-between divide-x-[1px] divide-black/70 w-full">
														<div class=" flex flex-col w-[45%] justify-end divide-y-[1px] divide-black/70">
															<div class="font-normal w-full h-10 flex justify-end items-center px-3">Opening Balance </div>
															<div class="font-normal w-full h-10 flex justify-end items-center px-3">Total Credits</div>
															<div class="font-normal w-full h-10 flex justify-end items-center px-3">Total Debits</div>
															<div class="font-normal w-full h-10 flex justify-end items-center px-3">Closing Balance</div>
															<!-- <div class="">Total Credits:</div>
															<div class="">Closing Balance:</div> -->
														</div>
														<div class=" flex flex-col w-[55%] divide-y-[1px] divide-black/70">
															<div class="font-bold w-full h-10 flex justify-end items-center px-3"
																> {$previousBalance !== null
																? formatAmount(
																		$previousBalance,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</div
															>
															<div class="font-bold w-full h-10 flex justify-end items-center px-3"
																> {$totalBalanceIn !== null
																? formatAmount(
																		$totalBalanceIn,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</div
															>
															<div class="font-bold w-full h-10 flex justify-end items-center px-3"
																> {$totalBalanceOut !== null
																? formatAmount(
																		$totalBalanceOut,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</div
															>
															<div class="font-bold w-full h-10 flex justify-end items-center px-3"
																> {$previousRowBalance !== null
																? formatAmount(
																		$previousRowBalance,
																		'currency',
																		$currencies[$statements[0].accountInfo.currency.value].currency,
																		$currencies[$statements[0].accountInfo.currency.value].locale
																  )
																: formatAmount()}</div
															>

														</div>
													</section>
													
												</div>
											</div>
											<div class="flex justify-between items-center w-full h-10 border-[1px] border-black/50 divide-x-[1px] divide-black/50 my-6">
												<section class="flex justify-start items-center w-[33.3333333333%] h-full divide-x-[1px] divide-black/50">
													<div class="font-normal w-fit h-full flex justify-end items-center px-3">Start Date </div>
													<div class="font-semibold w-fit h-full flex justify-end items-center px-3">{format(new Date($statements[0].duration.start.value), 'EEE, d MMM yyyy')} </div>
												</section>
												<section class="flex justify-start items-center w-[33.3333333333%] h-full divide-x-[1px] divide-black/50">
													<div class="font-normal w-fit h-full flex justify-end items-center px-3">End Date </div>
													<div class="font-semibold w-fit h-full flex justify-end items-center px-3">{format(new Date($statements[0].duration.end.value), 'EEE, d MMM yyyy')} </div>
												</section>
												<section class="flex justify-start items-center w-[33.3333333333%] h-full divide-x-[1px] divide-black/50">
													<div class="font-normal w-[50%] h-full flex justify-start items-center px-3">Transaction Count </div>
													<div class="font-semibold w-[50%] h-full flex justify-end items-center px-3">{$statements[0].newTransactions.length}</div>
												</section>
											</div>
										</section>	
									{:else if $displayHeaderChoice === 5}
										<section
											class="Account:Info w-full h-auto flex justify-between test:px-8 py-10 text-black/60"
										>
											<table class="table-auto w-[40%] font-semibold text-sm">
												<tbody class="flex justify-between">
													<tr class=" flex flex-col">
														<td class="">Account Statement for the period:</td>
														<td class="">Account Number:</td>
														<td class="">Account Name:</td>
														<td class="">Currency:</td>
														<td class="">Printed By:</td>
														<td class="">Branch:</td>
														<td class="">Date:</td>
												
													</tr>
													<tr class=" flex flex-col">
														<td class="">{lightFormat(
																new Date($statements[0].duration.start.value),
																'yyyyMMdd'
															)} to {lightFormat(
																new Date($statements[0].duration.end.value),
																'yyyyMMdd'
															)}</td>
														<td class="">{$statements[0].accountInfo.number.value}</td>
														<td class="">{$statements[0].accountInfo.name.value}</td>
														<td class=""
															>{$currencies[$statements[0].accountInfo.currency.value].currency}</td
														>
														<td class="">{$statements[0].accountInfo.printedBy.name.value}</td>
														<td class="">{$statements[0].accountInfo.branch.name.value}</td>
														<td class="">{format(
																new Date($statements[0].duration.dueDate.value),
																$statements[0].duration.dueDate.formats[3]
															).toUpperCase()}</td>
														
													</tr>
												</tbody>
											</table>
											<table class="table-auto w-[30%] font-semibold text-sm">
												<tbody class="flex justify-between">
													<tr class=" flex flex-col">
														<td class="">Address:</td>
														<td class="">Phone:</td>
														<td class="">Email:</td>
														<td class="">Account Type:</td>
														<td class="">IBAN:</td>
													</tr>
													<tr class=" flex flex-col">
														<div class=""> {$statements[0].bankInfo.address.value}</div>
														<div class=""> {$statements[0].bankInfo.call.mobile.value}</div>
														<div class=""> {$statements[0].accountInfo.accountType.value}</div>
														<div class=""> {$statements[0].bankInfo.email.value}</div>
														<div class=""> {$statements[0].accountInfo.IBAN.value}</div>
														
														
													</tr>
												</tbody>
											</table>
										</section>	
									

									{:else if $displayHeaderChoice === 6}
										<section class="flex flex-col relative">
											<h2 class="absolute text-black/60 font-semibold text-center top-2 left-0">
												To,
											</h2>
											<div class="w-full h-auto flex space-x-32 py-10 text-black/60">
												<table
													class="table-auto flex w-[30%] font-semibold text-sm border-2 border-black/60 border-solid"
												>
													<tbody class="flex justify-between max-h-fit">
														<tr class=" flex flex-col p-2">
															<td class="font-bold">{$statements[0].accountInfo.name.value}</td>
															<td class="font-bold">{$statements[0].bankInfo.city.value}</td>
															<td class="font-bold">{$statements[0].bankInfo.capital.value}</td>
															<td class="font-bold"
																>{$currencies[$statements[0].accountInfo.currency.value]
																	.currency}</td
															>
															<td class="font-bold">{$statements[0].accountInfo.number.value}</td>
														</tr>
														<!-- <td class=""
															>{lightFormat(
																new Date($statements[0].duration.start.value),
																'yyyy/MM/dd'
															)}</td
														>
														<td class=""
															>{lightFormat(
																new Date($statements[0].duration.end.value),
																'yyyy/MM/dd'
															)}</td
														> -->
													</tbody>
												</table>
												<table class="table-auto w-[30%] font-semibold text-sm">
													<tbody class="flex justify-between p-2">
														<tr class=" flex flex-col">
															<td class="font-bold">Branch ID</td>
															<td class="font-bold">Customer Name</td>
															<td class="font-bold">Product Name</td>
															<td class="font-bold">Currency</td>
															<!-- <td class="">Total Credits:</td>
															<td class="">Closing Balance:</td> -->
														</tr>
														<tr class=" flex flex-col">
															<td class="font-bold"
																>: {$statements[0].accountInfo.branch.id.value}</td
															>
															<td class="font-bold"
																>: {$statements[0].accountInfo.customer.name.value}</td
															>
															<td class="font-bold"
																>: {$statements[0].accountInfo.product.name.value}</td
															>
															<td class="font-bold"
																>: {$currencies[$statements[0].accountInfo.currency.value]
																	.currency}</td
															>
															<!-- <td class=""
																>USD {$totalBalanceOut !== null
																	? formatAmount($totalBalanceOut)
																	: formatAmount()}</td
															>
															<td class=""
																>USD {$previousRowBalance !== null
																	? formatAmount($previousRowBalance)
																	: formatAmount()}</td
															> -->
														</tr>
													</tbody>
												</table>
											</div>
											<div class="mb-5">
												<h2 class="text-black/60 text-center font-bold">
													{$statements[0].title.value}
													{$statements[0].id.value}
												</h2>
												<h3 class="text-black/50 text-center font-semibold">
													Statement Period (From <span class="text-black/60"
														>{format(
															new Date($statements[0].duration.start.value),
															'dd-MM-yyyy'
														)}</span
													>
													&nbsp;&nbsp; To
													<span class="text-black/60"
														>{format(
															new Date($statements[0].duration.end.value),
															'dd-MM-yyyy'
														)}</span
													>)
												</h3>
											</div>
										</section>	
									{:else}
									{/if}
								{:else}	
								{/if}

								{#if pageIndex !== 0}
									<!-- ? Deal with template switching -->
									{#if $displayHeaderChoice === 3}
										<section class="relative mt-2 mb-5">
											<span
												class="doc:ref absolute -top-[5px] left-0 font-bold h-[3px] w-[10px] border-t-2 border-t-black/60 border-t-solid"
											/>
											<span
												class="doc:ref absolute -bottom-[5px] left-0 font-bold h-[3px] w-[10px] border-b-2 border-b-black/60 border-b-solid"
											/>
											<h2 class="font-semibold">
												Account No.: <span class="">{$statements[0].accountInfo.number.value}</span>
											</h2>
											<h2 class="font-semibold">
												Customer Name: <span class=""
													>{$statements[0].accountInfo.customer.name.value}</span
												>
											</h2>
										</section>
									{/if}
									{#if $displayHeaderChoice === 4}
										<section class=" headerChoice:4 flex flex-col items-center w-full">
											<section class="flex items-center w-full mb-5">
												<div
													style="background-image: url({$logoUrl || ''});"
													class="logo:image bg-no-repeat bg-contain bg-left overflow-hidden
															{$isShowingLogoImage === true
														? 'scale-100 opacity-100 w-full h-[80px]'
														: 'w-[0px] h-[0px] scale-0 opacity-0'} {transition} origin-left"
												>
													{#if $logoUrl === ''}
														{#key $logoUrl}
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 48 48"
																class="w-full h-full"
															>
																<linearGradient
																	id="imCJKIfzwKtpBeBobeWKRa"
																	x1="18.766"
																	x2="27.561"
																	y1="1.896"
																	y2="42.938"
																	gradientUnits="userSpaceOnUse"
																>
																	<stop offset="0" stop-color="#21ad64" />
																	<stop offset="1" stop-color="#088242" />
																</linearGradient>
																<path
																	fill="url(#imCJKIfzwKtpBeBobeWKRa)"
																	d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
																/>
																<path
																	d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
																	opacity=".05"
																/>
																<path
																	d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
																	opacity=".07"
																/>
																<path
																	fill="#fff"
																	d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
																/>
															</svg>
														{/key}
													{/if}
												</div>
											</section>
										
										</section>		
									{/if}
									{#if $displayHeaderChoice === 6}
										<section class="relative mt-2 mb-5">
											<span
												class="doc:ref absolute -top-[5px] left-0 font-bold h-[3px] w-[10px] border-t-2 border-t-black/60 border-t-solid"
											/>
											<span
												class="doc:ref absolute -bottom-[5px] left-0 font-bold h-[3px] w-[10px] border-b-2 border-b-black/60 border-b-solid"
											/>
											<h2 class="font-semibold">
												Account No.: <span class="">{$statements[0].accountInfo.number.value}</span>
											</h2>
											<h2 class="font-semibold">
												Customer Name: <span class=""
													>{$statements[0].accountInfo.customer.name.value}</span
												>
											</h2>
										</section>
									{/if}
								{/if}

								<form action="" class="w-[100%]">
									<!-- <table class=" "> -->
									<section
										class="w-full h-12 {$displayHeaderChoice === 3 || $displayHeaderChoice === 6 
											? 'bg-transparent text-black border-2 border-black/60 border-solid'
											: `${$documentThemes[$activeTheme].bgHeader} text-white border-none`}  {transition}"
									>
										<div class="flex justify-between items-start w-full py-1 h-12 font-semibold">
											<!-- {#each newTransactions as record} -->

											<div
												class="{$statements[0].configurations.columnHeaders.renderDateColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center w-[10%] test_bg-red-500"
											>
												<span class="h-full"
													>{$statements[0].transactionHeaders.date.terms[
														$statements[0].transactionHeaders.date.counter
													]}</span
												>
											</div>

											<div
												class="
												{$displayHeaderChoice === 4 && 'order-first' }
												{$displayHeaderChoice === 5 && 'order-first' }
												{$statements[0].configurations.columnHeaders
													.renderBookingDateColumn === true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center w-[10%] test_bg-red-500"
											>
												<span class="h-full"
													>{$statements[0].transactionHeaders.bookingDate.terms[
														$statements[0].transactionHeaders.bookingDate.counter
													]}</span
												>
											</div>

											<div
												class="
												{$displayHeaderChoice === 4 && 'order-1' }
												{$displayHeaderChoice === 5 && 'order-4' }
												{$statements[0].configurations.columnHeaders
													.renderValueDateColumn === true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center w-[10%] test_bg-red-500"
											>
												<span class="h-full"
													>{$statements[0].transactionHeaders.valueDate.terms[
														$statements[0].transactionHeaders.valueDate.counter
													]}</span
												>
											</div>

											<!-- ? Branch -->
											<div
												class="
												{$displayHeaderChoice === 4 ? ' order-2 block ':' sr-only' }
												{$statements[0].configurations.columnHeaders.renderBranchColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center px-1 w-[10%] test_bg-blue-500"
											>
												<span class="h-full text-center">{ $statements[0].transactionHeaders.branch.terms[
														$statements[0].transactionHeaders.branch.counter
													]}</span>
											</div>

											<!-- ? OPE -->
											<div
												class="
												{$displayHeaderChoice === 4 ? ' order-3 block ':' sr-only' }
												{ $statements[0].configurations.columnHeaders.renderOpeColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center px-1 w-[10%] test_bg-blue-500"
											>
												<span class="h-full text-center">{$statements[0].transactionHeaders.ope.terms[
														$statements[0].transactionHeaders.ope.counter
													]}</span>
											</div>

											<!-- ? Narration -->
											<div
												class="
												{$displayHeaderChoice === 5 ? ' order-3 block w-[20%] px-1':' sr-only' }
												{ $statements[0].configurations.columnHeaders.renderNarrationColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full px-1 test_bg-blue-500"
											>
												<span class="h-full {$displayHeaderChoice === 5 ? 'text-left ':'text-center' }">{$statements[0].transactionHeaders.narration.terms[
														$statements[0].transactionHeaders.narration.counter
													]}</span>
											</div>

											<div
												class="
												{$displayHeaderChoice === 3 && 'w-auto flex-1' }
												{$displayHeaderChoice === 4 && 'order-5' }
												{$displayHeaderChoice === 5 ? 'order-2 w-[20%]':'w-[28%]' }
												{$statements[0].configurations.columnHeaders
													.renderDescriptionColumn === true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-left px-2 test_bg-blue-500"
											>
												<span class="h-full "
													>{$statements[0].transactionHeaders.description.terms[
														$statements[0].transactionHeaders.description.counter
													]}</span
												>
											</div>

											<div
												class="
												{$displayHeaderChoice === 3 && 'sr-only' }
												{$displayHeaderChoice === 4 && 'order-4' }
												{$displayHeaderChoice === 5 && 'order-1' }
												{$displayHeaderChoice === 4 ? 'px-1 w-[10%] text-center ':'px-5 w-[20%] text-left' }
												{$displayHeaderChoice === 5 ? 'px-1 w-[20%] text-left ':'w-[20%] text-left' }
												{$statements[0].configurations.columnHeaders.renderRefColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full  test_bg-blue-500"
											>
												<span class="h-full">{$statements[0].transactionHeaders.ref.terms[
														$statements[0].transactionHeaders.ref.counter
													]}</span>
											</div>

									

											<div
												class="
												{$displayHeaderChoice === 4 && 'order-6' }
												{$displayHeaderChoice === 5 && 'order-5' }
												{$statements[0].configurations.columnHeaders.renderOutColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center w-[10%] test_bg-lime-500 flex justify-end"
											>
												<span class="h-full">{$statements[0].transactionHeaders.out.terms[
														$statements[0].transactionHeaders.out.counter
													]}</span>
											</div>

											<div
												class="
												{$displayHeaderChoice === 4 && 'order-7' }
												{$displayHeaderChoice === 5 && 'order-6' }
												{$statements[0].configurations.columnHeaders.renderInColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center w-[10%] test_bg-purple-500 flex justify-end"
											>
												<span class="h-full"
													>{$statements[0].transactionHeaders.in.terms[
														$statements[0].transactionHeaders.in.counter
													]}</span
												>
											</div>

											<div
												class="
												{$displayHeaderChoice === 4 && 'order-last' }
												{$displayHeaderChoice === 5 && 'order-last' }
												{$statements[0].configurations.columnHeaders.renderBalanceColumn ===
													true ||
												$statements[0].configurations.columnHeaders.renderAllColumns === true
													? 'opacity-100 scale-x-100 origin-left-right'
													: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} !line-clamp-1 h-full text-center w-[10%] test_bg-yellow-500 pr-5 flex justify-end"
											>
												<span class="h-full"
													>{$statements[0].transactionHeaders.balance.terms[0]}</span
												>
											</div>

											<!-- {/each} -->
										</div>
									</section>
									{#if $displayHeaderChoice !== 3 && $displayHeaderChoice !== 4 && $displayHeaderChoice !== 5 && $displayHeaderChoice !== 6}
										<section class="flex flex-col w-full text-sm justify-start">
											{#key newTransactions || $statements[0].newTransactions || $activeTheme}
												<!-- svelte-ignore a11y-no-static-element-interactions -->
												<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
												<div
													tabindex="0"
													on:click={() => {
														// $selectedRowUUID = record.uuid;
														// $activeRecordID = index;
														// console.log(
														// 	`CLICK: Selected Record: ${$selectedRowUUID} | CLICK: Current Record ${record.uuid}`
														// );
													}}
													on:focus={() => {
														// $selectedRowUUID = record.uuid;
														// $activeRecordID = index;
														// console.log(
														// 	`FOCUS: Selected Record: ${$selectedRowUUID} | FOCUS: Current Record ${record.uuid}`
														// );
													}}
													on:keyup={() => {
														// console.log('click');
													}}
													class=" 
												flex justify-start {$documentThemes[$activeTheme]
														.primaryBg} text-white items-start w-full group transition-all duration-300 ease-out"
												>
													<!-- <div class=" pl-5 pr-5 w-[10%] self-start flex justify-between items-center">
											<span class="!w-full" />
										</div> -->
													<div
														class=" test:py-4 h-10 px-8 w-[50%] flex flex-col justify-start items-start font-bold"
													>
														<span class="!w-full">Previous Balance</span>
													</div>
													<div
														class="
											
											w-[50%] py-4 px-8 flex justify-end items-start font-bold"
													>
														<span class=""
															>{$previousBalance !== null
																? formatAmount($previousBalance, 'decimal')
																: formatAmount(0, 'decimal')}</span
														>
													</div>
												</div>
											{/key}
										</section>
									{/if}

									<section class="flex flex-col items-start w-full text-sm">
										{#key newTransactions || $statements[0].newTransactions || $activeTheme}
											{#each $statements[0].newTransactions as record, index}
												<!-- svelte-ignore a11y-no-static-element-interactions -->
												<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
												<!-- {#if isCurrentTransactionRecordBelongsToThisPage(record.uuid, pageIndex, index) === true} -->
												{#if $statements[0].configurations.pageSettings.pagesUUIDs[index] === pageIndex}
													<div
														data-raw-index={index}
														data-verify-belongsHere={$statements[0].configurations.pageSettings
															.pagesUUIDs[index] === pageIndex}
														data-page-index={pageIndex}
														data-raw-active={$activeRecordID}
														tabindex="0"
														on:click={(e) => {
															// switch tab when selecting a record
															const editorTransactionTabBtn =
																document.getElementById('transactionTabBtn');
															editorTransactionTabBtn.click();

															$selectedRowUUID = record.uuid;
															$activeRecordID = index;

															// console.log(e.currentTarget.children);

															// console.log(
															// 	`CLICK: Selected Record: ${$selectedRowUUID} | CLICK: Current Record ${record.uuid}`
															// );
														}}
														on:focus={() => {
															// switch tab when selecting a record
															const editorTransactionTabBtn =
																document.getElementById('transactionTabBtn');
															editorTransactionTabBtn.click();

															$selectedRowUUID = record.uuid;
															$activeRecordID = index;

															// console.log(
															// 	`FOCUS: Selected Record: ${$selectedRowUUID} | FOCUS: Current Record ${record.uuid}`
															// );
														}}
														on:keyup={() => {
															// switch tab when selecting a record
															const editorTransactionTabBtn =
																document.getElementById('transactionTabBtn');
															editorTransactionTabBtn.click();

															// console.log('click');
														}}
														on:focuswithin={() => {
															// switch tab when selecting a record
															const editorTransactionTabBtn =
																document.getElementById('transactionTabBtn');
															editorTransactionTabBtn.click();
														}}
														on:focusControlChanged={(e) => {
															// console.log(e.detail.control);
														}}
														class=" 

														{renderRowBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderRowBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderRowBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderRowBorders_bottom === true
															? 'last:border-b-2 last:border-b-black/60 last:border-b-solid'
															: 'border-b-0'}
														
														{$selectedRowUUID === record.uuid
															? `z-30 py-0 shadow-xl rounded-md !ring-1 ring-solid ${$documentThemes[$activeTheme].ring} ring-offset-2 ring-offset-transparent`
															: `z-10 py-0 shadow-none rounded-none !ring-0 ${$documentThemes[$activeTheme].bgEven}`}
											focus:py-4 focus:outline-none focus:shadow-xl !focus:ring-4 focus:ring-solid {$documentThemes[
															$activeTheme
														].ringFocus} focus:ring-offset-2 focus:ring-offset-transparent
											flex justify-between hover:shadow-xl hover:cursor-pointer hover:text-white/90 {$documentThemes[
															$activeTheme
														].primaryBgHover} test_odd:bg-slate-100
															{$statements[0].configurations.rowPadding.top === true ? 'first:pt-4' : 'first:pt-0'}
															{$statements[0].configurations.rowPadding.bottom === true ? 'last:pb-4' : 'last:pb-0'}
															w-full group transition-all duration-300 ease-out"
													>
														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																let element = document.getElementById('date');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderDateColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition}   w-[10%] flex justify-between items-center"
														>
															<span
																class="flex justify-center items-center !w-full {record.date ===
																undefined
																	? 'text-red-600'
																	: 'text-current'}
													{$selectedRowUUID === record.uuid && $activeFieldName === 'date'
																	? `px-2 py-3 mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-0 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}
													">{record.date !== undefined ? lightFormat(new Date(record.date), 'MM/dd/yyyy') : 'Date?'}</span
															>
														</div>

														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																let element = document.getElementById('bookingDate');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 4 && 'order-first' }
															{$displayHeaderChoice === 5 && 'order-first' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}

															{$statements[0].configurations.columnHeaders.renderBookingDateColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} w-[10%] flex justify-between items-center"
														>
															<span
																class="flex justify-center items-center !w-full {record.bookingDate ===
																undefined
																	? 'text-red-600'
																	: 'text-current'}

													{$selectedRowUUID === record.uuid && $activeFieldName === 'bookingDate'
																	? `px-2 py-3 mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-0 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}
													"
																>{record.bookingDate !== undefined
																	? format(new Date(record.bookingDate), 'MM/dd/yyyy')
																	: 'Date?'}</span
															>
														</div>

														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																let element = document.getElementById('valueDate');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 4 && 'order-1' }
															{$displayHeaderChoice === 5 && 'order-4' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															
															{$statements[0].configurations.columnHeaders.renderValueDateColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} w-[10%] flex justify-between items-center"
														>
															<span
																class="flex justify-center items-center !w-full {record.valueDate ===
																undefined
																	? 'text-red-600'
																	: 'text-current'}
													{$selectedRowUUID === record.uuid && $activeFieldName === 'valueDate'
																	? `px-2 py-3 mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-0 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}
													"
																>{record.valueDate !== undefined
																	? lightFormat(new Date(record.valueDate), 'MM/dd/yyyy')
																	: 'Date?'}</span
															>
														</div>


														<!-- ? Branch -->
														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																$activeFieldName = 'branch';
																let element = document.getElementById('branch');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 4 && 'order-2' }
															{$displayHeaderChoice === 4 ? 'px-1 w-[10%] text-center flex':'px-5 w-[20%] text-left hidden' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderBranchColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} justify-center items-center"
														>
															<span
																class="flex justify-center items-center !w-full {$selectedRowUUID ===
																	record.uuid && $activeFieldName === 'branch'
																	? `px-2 py-3 -mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-2 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}">{record.branch}</span
															>
														</div>

														<!-- ? OPE -->
														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
															  $activeFieldName = 'ope';
																let element = document.getElementById('ope');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 4 && 'order-3' }
															{$displayHeaderChoice === 4 ? 'px-1 w-[10%] text-center flex':'px-5 w-[20%] text-left hidden' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderOpeColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition}  justify-center items-center"
														>
															<span
																class="flex justify-center items-center !w-full {$selectedRowUUID ===
																	record.uuid && $activeFieldName === 'ope'
																	? `px-2 py-3 -mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-2 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}">{record.ope}</span
															>
														</div>


														<!-- ? Narration -->
														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
															  $activeFieldName = 'narration';
																let element = document.getElementById('narration');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 5 && 'order-3' }
															{$displayHeaderChoice === 5 && 'order-3' }
															{$displayHeaderChoice === 5 ? 'px-1 w-[20%] text-left flex':'px-5 w-[20%] text-left hidden' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderNarrationColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition}  justify-center items-center"
														>
															<span
																class="flex !w-full {$selectedRowUUID ===
																	record.uuid && $activeFieldName === 'narration'
																	? `px-2 py-3 -mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-2 py-0 mx-0 test:cornered-none bg-current}`}

																	{$displayHeaderChoice === 5 ? 'justify-start items-start':'justify-center items-center' }
													{transition}">{record.narration}</span
															>
														</div>


														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																$activeFieldName = 'more';
																let element = document.getElementById('more');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 3 && 'w-auto flex-1' }
															{$displayHeaderChoice === 4 && 'order-5' }
															{$displayHeaderChoice === 5 && 'order-2' }
															{$displayHeaderChoice === 5 ? 'w-[20%]':'w-[28%]' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderDescriptionColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} px-2 flex flex-col justify-center"
														>
															<span
																class="flex  !w-full {$selectedRowUUID ===
																	record.uuid && $activeFieldName === 'more'
																	? `px-2 py-3 -mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-0 py-0 mx-0 test:cornered-none bg-current}`}

																	{$displayHeaderChoice === 5 ? 'justify-start items-start':'justify-start items-center' }
													{transition}">{record.description}</span
															>
															{#key $showMoreDescription}
																{#if record.more !== '' && $showMoreDescription === true}
																	<span
																		class="
												{$selectedRowUUID === record.uuid
																			? ` ${$documentThemes[$activeTheme].accentActive}  `
																			: ` ${$documentThemes[$activeTheme].accent}`}
												!w-full text-[11px] leading-3 italic {$documentThemes[$activeTheme].accentHover}
														{$selectedRowUUID === record.uuid && $activeFieldName === 'more'
																			? `px-2 py-3 mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																			: `px-0 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}
														">{record.more}</span
																	>
																{/if}
															{/key}
														</div>

														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																let element = document.getElementById('ref');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 3 && 'sr-only' }
															{$displayHeaderChoice === 4 && 'order-4' }
															{$displayHeaderChoice === 5 && 'order-1' }
															{$displayHeaderChoice === 4 ? 'px-1 w-[10%] text-center':'px-5 w-[20%] text-left' }
															{$displayHeaderChoice === 5 ? 'px-1 w-[20%] text-left':'px-5 w-[20%] text-left' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderRefColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} flex justify-center items-center"
														>
															<span
																class="
																{$displayHeaderChoice === 4 ? 'justify-center':'justify-start' }
																flex  items-center !w-full {$selectedRowUUID ===
																	record.uuid && $activeFieldName === 'ref'
																	? `px-2 py-3 -mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																	: `px-0 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}">{record.ref}</span
															>
														</div>

														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																let element = document.getElementById('out');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 4 && 'order-6' }
															{$displayHeaderChoice === 5 && 'order-5' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderOutColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} w-[10%] flex justify-center items-center"
														>
															{#if record.type === 'out'}
																<span
																	transition:fade
																	class="{$selectedRowUUID === record.uuid &&
																	$activeFieldName === 'amount-out'
																		? `px-2 py-3 mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																		: `px-0 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}"
																	>{record.type.toLowerCase() === 'out'
																		? formatAmount(record.amount, 'decimal')
																		: ''}</span
																>
															{/if}
														</div>

														<!-- svelte-ignore a11y-click-events-have-key-events -->
														<div
															on:click={(e) => {
																// $activeEditorTab = 'transactionTab';
																// console.log(e);
																let element = document.getElementById('in');

																const interval = setTimeout(() => {
																	element.focus();
																	return clearTimeout(interval);
																}, 500);
																// console.log(element);
															}}
															class="
															{$displayHeaderChoice === 4 && 'order-7' }
															{$displayHeaderChoice === 5 && 'order-6' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true ? 'border-r-2 border-r-black/60 border-r-solid' : 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderInColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition} w-[10%] flex justify-center items-center"
														>
															{#if record.type === 'in'}
																<span
																	transition:fade
																	class="{$selectedRowUUID === record.uuid &&
																	$activeFieldName === 'amount-in'
																		? `px-2 py-3 mx-2 test:cornered rounded-sm ${$documentThemes[$activeTheme].primaryBgUseFocus} ${$documentThemes[$activeTheme].primaryGroupHoverBgUseFocus}`
																		: `px-0 py-0 mx-0 test:cornered-none bg-current}`}
													{transition}"
																	>{record.type.toLowerCase() === 'in'
																		? formatAmount(record.amount, 'decimal')
																		: ''}</span
																>
															{/if}
														</div>

														<div
															class="
															{$displayHeaderChoice === 4 && 'order-last' }
															{$displayHeaderChoice === 5 && 'order-last' }
															{$selectedRowUUID === record.uuid ? 'py-3' : 'py-2'}

															{renderCellBorders_left === true ? 'border-l-2 border-l-black/60 border-l-solid' : 'border-l-0'}
														{renderCellBorders_right === true && renderRowBorders_right !== true
																? 'border-r-2 border-r-black/60 border-r-solid'
																: 'border-r-0'}
														{renderCellBorders_top === true ? 'border-t-2 border-t-black/60 border-t-solid' : 'border-t-0'}
														{renderCellBorders_bottom === true ? 'border-b-2 border-b-black/60 border-b-solid' : 'border-b-0'}
															
															{$statements[0].configurations.columnHeaders.renderBalanceColumn === true ||
															$statements[0].configurations.columnHeaders.renderAllColumns === true
																? 'opacity-100 scale-x-100 origin-left-right'
																: 'opacity-0 !w-[0px] scale-x-0 origin-right-left'} {transition}
										{$selectedRowUUID === record.uuid
																? ` ${$documentThemes[$activeTheme].primaryActiveText}  `
																: ` ${$documentThemes[$activeTheme].primaryText}`}
											
										w-[10%] flex group-hover:text-white font-semibold justify-center items-center"
														>
															<span class="flex justify-center items-center"
																>{formatAmount(record.balance, 'decimal')}</span
															>
														</div>
													</div>
												{/if}
											{/each}
										{/key}
									</section>
									{#if $statements[0].configurations.renderEndingBalanceRow === true || $statements[0].configurations.columnHeaders.renderAllColumns === true}
										<section class="flex flex-col w-full text-sm">
											{#key newTransactions || $statements[0].newTransactions || $transactions || $activeRecordID || $activeTheme}
												<!-- svelte-ignore a11y-no-static-element-interactions -->
												<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
												<div
													tabindex="0"
													on:click={() => {
														// $selectedRowUUID = record.uuid;
														// $activeRecordID = index;
														// console.log(
														// 	`CLICK: Selected Record: ${$selectedRowUUID} | CLICK: Current Record ${record.uuid}`
														// );
													}}
													on:focus={() => {
														// $selectedRowUUID = record.uuid;
														// $activeRecordID = index;
														// console.log(
														// 	`FOCUS: Selected Record: ${$selectedRowUUID} | FOCUS: Current Record ${record.uuid}`
														// );
													}}
													on:keyup={() => {
														// console.log('click');
													}}
													class=" 
												flex justify-start {$documentThemes[$activeTheme]
														.primaryBg} text-white p-3 items-center w-full group transition-all duration-300 ease-out"
												>
													<div
														class=" pl-5 pr-5 w-[10%] self-start flex justify-between items-center"
													>
														<span class="!w-full" />
													</div>
													<div class=" w-[50%] flex flex-col justify-start font-bold">
														<span class="!w-full">Ending Balance</span>
													</div>
													<div
														class="
											
										pr-2 w-[50%] flex justify-end font-bold"
													>
														<span class=""
															>{$previousBalance !== null
																? $previousRowBalance.toFixed(2)
																: parseFloat('0').toFixed(2)}</span
														>
													</div>
												</div>
											{/key}
										</section>
									{/if}
									<!-- </table> -->
									<div class="" />
								</form>
							</div>
							<!-- Document footer -->

							{#if $displayHeaderChoice === 1}
								<div
									class="flex justify-between items-center h-fit w-full test:bg-red-600 justify-self-end text-xs font-semibold text-black/50"
								>
									<h2 class="doc:ref">
										{$statements[0].footer.ref.label}:
										{$statements[0].footer.ref.value}
									</h2>
									<h2 class="doc:pages">
										<span class="">{pageIndex + 1}</span>
										<span class="opacity-90"> of </span>
										<span class="opacity-90"
											>{$statements[0].configurations.pageSettings.pages.length} Pages</span
										>
									</h2>
									<h2 class="doc:bankOfficer">
										{$statements[0].footer.bankOfficer.value}
									</h2>
								</div>
							{:else if $displayHeaderChoice === 2}
								<div
									class="flex justify-between items-center h-fit w-full test:bg-red-600 justify-self-end text-xs font-semibold text-black/50"
								>
									<h2 class="doc:ref">
										{$statements[0].footer.ref.value}
									</h2>
									<h2 class="doc:pages">
										<span class="">{pageIndex + 1}</span>
										<span class="opacity-90"> of </span>
										<span class="opacity-90"
											>{$statements[0].configurations.pageSettings.pages.length} Pages</span
										>
									</h2>
									<h2 class="doc:bankOfficer">{$statements[0].footer.bankOfficer.value}</h2>
								</div>
							{:else if $displayHeaderChoice === 3}
								<div
									class="relative flex flex-col justify-center h-fit w-full test:bg-red-600 justify-self-end text-xs font-semibold text-black/70"
								>
									<span
										class="doc:ref absolute -top-[5px] left-0 font-bold h-[3px] w-[10px] border-t-2 border-t-black/60 border-t-solid"
									/>
									<h2 class="doc:note_info font-bold text-[11px]">
										<span class="opacity-100">{$statements[0].note.value} </span>
									</h2>
									<h2 class="doc:statement_id text-center font-bold text-[11px]">
										{$statements[0].accountInfo.IBAN.value}
									</h2>
									<!-- {$statements[0].footer.bankOfficer.label}: {$statements[0].footer.bankOfficer.value} -->
								</div>
							
							{:else if $displayHeaderChoice === 4}
								<div
									class="relative flex flex-col justify-center h-fit w-full test:bg-red-600 justify-self-end text-xs font-semibold text-black/70"
								>

									<h2 class="doc:note_info  flex justify-center space-x-20 text-center font-bold text-[11px]">
										<span class="opacity-100">Account Statement for {$statements[0].accountInfo.number.value} {$currencies[$statements[0].accountInfo.currency.value].currency}</span>
										<span class="opacity-100">
											<span class="">-- Page {pageIndex + 1}</span>
											<span class="opacity-90"> of </span>
											<span class="opacity-90">{$statements[0].configurations.pageSettings.pages.length}</span>
										</span>
									</h2>

									<!-- // {$statements[0].footer.bankOfficer.label}: {$statements[0].footer.bankOfficer.value} -->
								</div>
							{:else if $displayHeaderChoice === 5}
								<div
									class="relative border-t-2 border-black/50 flex flex-col justify-center h-fit w-full test:bg-red-600 justify-self-end text-xs font-semibold text-black/70"
								>

									<h2 class="doc:note_info  flex justify-end font-bold text-[11px] pt-2">
										<span class="opacity-100">
											<span class="">Page {pageIndex + 1}</span>
											<span class="opacity-90"> of </span>
											<span class="opacity-90">{$statements[0].configurations.pageSettings.pages.length}</span>
										</span>
									</h2>

									<!-- // {$statements[0].footer.bankOfficer.label}: {$statements[0].footer.bankOfficer.value} -->
								</div>
							{:else if $displayHeaderChoice === 6}
								<div
									class="relative flex flex-col justify-center h-fit w-full test:bg-red-600 justify-self-end text-xs font-semibold text-black/70"
								>
									<span
										class="doc:ref absolute -top-[5px] left-0 font-bold h-[3px] w-[10px] border-t-2 border-t-black/60 border-t-solid"
									/>
									<h2 class="doc:note_info font-bold text-[11px]">
										<span class="opacity-100">{$statements[0].note.value} </span>
									</h2>
									<h2 class="doc:statement_id text-center font-bold text-[11px]">
										{$statements[0].accountInfo.IBAN.value}
									</h2>
									<!-- {$statements[0].footer.bankOfficer.label}: {$statements[0].footer.bankOfficer.value} -->
								</div>	
							{/if}
						</div>
					{/each}

					<!-- {/if} -->
					<!-- {:catch error}
					<span class="text-red-600 font-bold text-2xl">{error}</span>
				{/await} -->
				{/if}
			</section>

			<!-- {#await initiateSetDates()}
				<span class="text-yellow-600 font-bold text-2xl">Waiting a promise...</span>
			{:then newRange} -->
		</div>
	</section>

	<section
		class=" test:z-50 test:absolute test:top-0 test:right-0 flex-shrink-0 shadow-none test:bg-[#0b0b0b] test:bg-gray-50/70 bg-[#fbfbfb] test:bg-white border-none border test:border-solid border-black/50 test_py-10 !w-[250px] h-screen scroll-smooth scrollbar-thin overflow-hidden"
	>
		<div class="tabs flex justify-between items-center w-[95%] p-2 h-fit bg-[#2f4f4f05] m-[5px] rounded-md">
			<button
				on:click={() => {
					$activeEditorTab = 'statementTab';
					const tabContainer = document.getElementById('editorTabsContain');

					tabContainer.classList.remove('transactionTabisOn');
					tabContainer.classList.remove('componentsTabisOn');
					tabContainer.classList.add('statementTabisOn');
				}}
				id="statementTabBtn"
				class="py-3 px-4 {$activeEditorTab === 'statementTab'
					? ' text-[#00599991] bg-[#7878780a]'
					: 'bg-transparent  text-slate-400'} text-xs font-semibold w-fit rounded-md line-clamp-1"
				type="button">
					<svg class=" fill-current" viewBox="0 0 48 48" width="30" height="30">
						<path d="M41.877,12.214L26.565,4.601c-1.607-0.8-3.524-0.8-5.132,0L6.092,12.23c-0.815,0.429-1.23,1.354-1.01,2.25C5.304,15.375,6.102,16,7.023,16H10.5c0.828,0,1.5,0.672,1.5,1.5S11.328,19,10.5,19c-0.231,0-1.146,0-3.5,0v5v14.5c0,3.033,2.468,5.5,5.5,5.5h23c3.032,0,5.5-2.467,5.5-5.5V26v-7c-2.429,0-3.268,0-3.5,0c-0.828,0-1.5-0.672-1.5-1.5s0.672-1.5,1.5-1.5h3.477c0.922,0,1.72-0.625,1.941-1.52C43.139,13.585,42.724,12.66,41.877,12.214z M25.375,34.25v1.375C25.375,36.384,24.76,37,24,37s-1.375-0.616-1.375-1.375v-1.38c-1.71-0.013-3.275-0.638-4.41-1.773c-0.537-0.537-0.537-1.407,0-1.944c0.537-0.537,1.408-0.537,1.945,0c0.443,0.443,1.24,0.972,2.517,0.972h2.698c1.137,0,2.063-0.925,2.063-2.062c0-1.138-0.926-2.063-2.063-2.063h-2.406c-2.654,0-4.813-2.159-4.813-4.813c0-2.535,1.978-4.598,4.469-4.777v-1.41C22.625,15.616,23.24,15,24,15s1.375,0.616,1.375,1.375v1.396c2.123,0.107,3.478,1.321,3.905,1.984c0.412,0.638,0.228,1.489-0.41,1.9c-0.639,0.409-1.49,0.228-1.9-0.41v0.001c-0.004,0-0.595-0.746-1.887-0.746h-2.114c-1.137,0-2.063,0.925-2.063,2.062c0,1.138,0.926,2.063,2.063,2.063h2.406c2.653,0,4.812,2.159,4.812,4.813C30.187,32.091,28.028,34.25,25.375,34.25z"/>
					</svg>
				</button
			>
			<button
				on:click={() => {
					$activeEditorTab = 'transactionTab';
					const tabContainer = document.getElementById('editorTabsContain');

					tabContainer.classList.remove('statementTabisOn');
					tabContainer.classList.remove('componentsTabisOn');
					tabContainer.classList.add('transactionTabisOn');
				}}
				id="transactionTabBtn"
				class="py-3 px-4 {$activeEditorTab === 'transactionTab'
					? ' text-[#00599991] bg-[#7878780a]'
					: 'bg-transparent  text-slate-400'} text-xs font-semibold w-fit rounded-md line-clamp-1"
				type="button">
					<svg class=" fill-current" viewBox="0 0 48 48" width="30" height="30">
						<path d="M24 4C18.556953 4 13.61141 6.1899788 10 9.7304688L10 9 A 2.0002 2.0002 0 0 0 7.9707031 6.9726562 A 2.0002 2.0002 0 0 0 6 9L6 15 A 2.0002 2.0002 0 0 0 8 17L14 17 A 2.0002 2.0002 0 1 0 14 13L12.382812 13C15.296186 9.9213791 19.413148 8 24 8C32.860089 8 40 15.139911 40 24C40 32.860089 32.860089 40 24 40 A 2.0002 2.0002 0 1 0 24 44C35.021911 44 44 35.021911 44 24C44 12.978089 35.021911 4 24 4 z M 23.970703 10.972656 A 2.0002 2.0002 0 0 0 22 13L22 13.255859C19.182699 13.858059 17 16.264295 17 19.25C17 22.678096 19.821904 25.5 23.25 25.5L24.25 25.5C25.791795 25.5 27 26.708205 27 28.25C27 29.791795 25.791795 31 24.25 31L23 31C22.049677 31 21.286938 30.361997 21.064453 29.507812 A 2.0002 2.0002 0 1 0 17.193359 30.515625C17.781865 32.775064 19.687421 34.428067 22 34.830078L22 35 A 2.0002 2.0002 0 1 0 26 35L26 34.642578C28.846019 33.850008 31 31.334933 31 28.25C31 24.545795 27.954205 21.5 24.25 21.5L23.25 21.5C21.984096 21.5 21 20.515904 21 19.25C21 17.984096 21.984096 17 23.25 17L24.5 17C25.443192 17 26.203383 17.632009 26.431641 18.476562 A 2.0002 2.0002 0 1 0 30.292969 17.431641C29.733 15.359757 28.066282 13.796644 26 13.253906L26 13 A 2.0002 2.0002 0 0 0 23.970703 10.972656 z M 6 22.039062C4.89 22.039062 4 22.939062 4 24.039062C4 25.149062 4.9 26.039062 6 26.039062C7.11 26.029062 8 25.139297 8 24.029297C8 22.929297 7.1 22.039062 6 22.039062 z M 7.3886719 28.917969C7.1289844 28.916094 6.864375 28.965312 6.609375 29.070312C5.589375 29.500312 5.1092969 30.669453 5.5292969 31.689453C5.8492969 32.459453 6.6008594 32.919922 7.3808594 32.919922C7.6408594 32.919922 7.9003906 32.869531 8.1503906 32.769531C9.1703906 32.339531 9.6507031 31.170391 9.2207031 30.150391C8.9057031 29.385391 8.1677344 28.923594 7.3886719 28.917969 z M 11.287109 34.744141C10.775859 34.744141 10.265859 34.940078 9.8808594 35.330078C9.0908594 36.120078 9.1008594 37.380156 9.8808594 38.160156C10.270859 38.550156 10.779062 38.75 11.289062 38.75C11.799062 38.75 12.320937 38.550156 12.710938 38.160156C13.490938 37.380156 13.479219 36.110078 12.699219 35.330078C12.309219 34.940078 11.798359 34.744141 11.287109 34.744141 z M 17.115234 38.644531C16.331953 38.64875 15.594297 39.115859 15.279297 39.880859C14.859297 40.900859 15.349141 42.070234 16.369141 42.490234C16.619141 42.590234 16.880859 42.640625 17.130859 42.640625C17.920859 42.640625 18.660469 42.180156 18.980469 41.410156C19.400469 40.390156 18.920391 39.219062 17.900391 38.789062L17.900391 38.800781C17.642891 38.693281 17.376328 38.643125 17.115234 38.644531 z"/>
					</svg>
				</button
			>
			<button
				on:click={() => {
					$activeEditorTab = 'componentsTab';
					const tabContainer = document.getElementById('editorTabsContain');

					tabContainer.classList.remove('transactionTabisOn');
					tabContainer.classList.remove('statementTabisOn');
					tabContainer.classList.add('componentsTabisOn');
				}}
				id="componentsTabBtn"
				class="py-3 px-4 {$activeEditorTab === 'componentsTab'
					? ' text-[#00599991] bg-[#7878780a]'
					: 'bg-transparent  text-slate-400'} text-xs font-semibold w-fit rounded-md line-clamp-1"
				type="button">
					<svg class=" fill-current" viewBox="0 0 48 48" width="30" height="30">
						<path d="M9 38.5c0 .17.01.34.03.5H5.5C3.57 39 2 37.43 2 35.5v-23C2 10.57 3.57 9 5.5 9h3.53C9.01 9.16 9 9.33 9 9.5V38.5zM46 12.5v23c0 1.93-1.57 3.5-3.5 3.5h-3.53c.02-.16.03-.33.03-.5v-29c0-.17-.01-.34-.03-.5h3.53C44.43 9 46 10.57 46 12.5zM33.5 6h-19C12.57 6 11 7.57 11 9.5v29c0 1.93 1.57 3.5 3.5 3.5h19c1.93 0 3.5-1.57 3.5-3.5v-29C37 7.57 35.43 6 33.5 6zM18.5 35c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5S19.328 35 18.5 35zM18.5 29c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5S19.328 29 18.5 29zM18.5 23c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5S19.328 23 18.5 23zM29.5 35h-6c-.829 0-1.5-.672-1.5-1.5s.671-1.5 1.5-1.5h6c.829 0 1.5.672 1.5 1.5S30.329 35 29.5 35zM29.5 29h-6c-.829 0-1.5-.672-1.5-1.5s.671-1.5 1.5-1.5h6c.829 0 1.5.672 1.5 1.5S30.329 29 29.5 29zM29.5 23h-6c-.829 0-1.5-.672-1.5-1.5s.671-1.5 1.5-1.5h6c.829 0 1.5.672 1.5 1.5S30.329 23 29.5 23zM29.5 16h-11c-.829 0-1.5-.672-1.5-1.5s.671-1.5 1.5-1.5h11c.829 0 1.5.672 1.5 1.5S30.329 16 29.5 16z"/>
					</svg>
				</button
			>
		</div>
		<div class="flex justify-center items-center w-full py-4">
			<button
				type="button"
				on:click={() => {
					// const addNewRecordButton = document.getElementById('addNewRecordButton');

					async function prepareDocument() {}

					async function generatePDF() {
						const content = document.getElementById('page_0');

						// console.log(content);
						// return;

						if (!content) {
							console.error('Content element not found');
							return;
						}
						// type: 'jpeg', quality: 0.95
						// type: 'png', quality: 0.98
						const pdfOptions = {
							margin: 0,
							filename: 'generated_pdf.pdf',
							image: { type: 'jpeg', quality: 0.95 },
							html2canvas: { scale: 2 },
							jsPDF: { unit: 'px', format: [1191, 1684], orientation: 'portrait' }
						};

						pdf = await html2pdf().set(pdfOptions).from(content).save();

						// Optionally, you can manipulate the pdf object or save it directly
						// pdf.save();
					}

					generatePDF();
				}}
				class=" sr-only py-2 px-4 bg-gradient-to-tr from-amber-600 to-amber-400 text-white text-sm font-normal rounded-md"
			>
				Export Document html2pdf
			</button>
			<button
				type="button"
				disabled={$documentIsExporting}
				on:mousedown={() => {
					$documentIsExporting = true;
					// const addNewRecordButton = document.getElementById('addNewRecordButton');

					async function forgePDFs() {
						$fordgingStatus = 'fordging';
						$fordgingStatusDetail = 'Forging documents';
						const canvasElement = document.getElementById('canvas');

						if (!canvasElement) {
							console.error('Canvas element not found');
							return;
						}

						// Dynamically retrieve the child elements of #canvas and extract their IDs
						const pageElements = Array.from(canvasElement.children);
						const pageIds = pageElements.map((pageElement) => pageElement.id);
						const forgedPDFs = [];

						for (const pageId of pageIds) {
							const content = document.getElementById(pageId);

							if (content) {
								const pdfOptions = {
									margin: 0,
									filename: `${pageId}_pdf.pdf`,
									image: { type: 'jpeg', quality: 0.95 },
									html2canvas: { scale: 2 },
									jsPDF: { unit: 'px', format: [1191, 1684], orientation: 'portrait' }
								};

								const pdf = await html2pdf().set(pdfOptions).from(content).outputPdf();

								forgedPDFs.push(btoa(pdf));
							} else {
								console.error(`Content element with ID ${pageId} not found.`);
							}
						}

						return forgedPDFs;

						//console.log('Forged PDFs:', forgedPDFs);

						// Optionally, you can perform further operations with forgedPDFs array
					}

					async function mergePDFs(pdfs) {
						$fordgingStatusDetail = 'Extracting pages...';
						const pdfDoc = await PDFDocument.create();
						// console.log(pdfDoc);
						pdfDoc.setCreationDate(new Date());
						pdfDoc.setModificationDate(new Date());
						pdfDoc.setProducer('StatementsForge Pro 1.0');
						pdfDoc.setSubject('Bank Statement');
						pdfDoc.setAuthor($statements[0].accountInfo.printedBy.name.value);
						// pdfDoc.addJavaScript('foo', 'function foo() { return "foo"; }'

						const pages = [];
						for (let idx = 0; idx < pdfs.length; idx++) {
							// let currentPageName = `page${idx+1}`

							const existingPage = await pdfDoc.copyPages(await PDFDocument.load(pdfs[idx]), [0]);
							pages.push(existingPage[0]);
						}
						// console.log(pages);
						$fordgingStatus = 'fordging';
						$fordgingStatusDetail = 'Collecting pages...';

						for (const page of pages) {
							// console.log(page);

							pdfDoc.addPage(page);
							// console.log(pdfDoc);
						}

						// const [page1] = await pdfDoc.copyPages(await PDFDocument.load(pdfs[0]), [0]);
						// const [page2] = await pdfDoc.copyPages(await PDFDocument.load(pdfs[1]), [0]);

						// pdfDoc.addPage(page1);
						// pdfDoc.addPage(page2);

						// await pdfDoc.save()

						const mergedPDFBytes = await pdfDoc.save();
						return mergedPDFBytes;
					}

					// Call the forgePDFs function
					forgePDFs().then((forgedPDFs) => {
						// console.log('Forged PDFs:', forgedPDFs);

						mergePDFs(forgedPDFs).then((mergedPDFBytes) => {
							// console.log('Merged PDFs:', mergedPDFBytes);
							// mergedPDFBytes.save();

							async function savePdf(data) {
								$fordgingStatusDetail = 'Saving and exporting...';

								// await createDir('saved', { dir: BaseDirectory.AppData, recursive: true }
								// );
								// await writeBinaryFile(
								// 	{ path: 'saved/StatementsForge.pdf', contents: new Uint8Array(data) },
								// 	{ dir: BaseDirectory.AppData }
								// );

								// Create a Blob from the merged PDF bytes
								const blob = new Blob([data], { type: 'application/pdf' });

								// Create a download link
								const link = document.createElement('a');
								link.href = URL.createObjectURL(blob);
								link.download = 'StatementForge.pdf';

								// Add an event listener to track download progress
								link.addEventListener('click', async () => {
									const response = await fetch(link.href);
									const total = parseInt(response.headers.get('content-length'), 10) || 0;
									let loaded = 0;

									const reader = response.body.getReader();

									while (true) {
										const { done, value } = await reader.read();
										if (done) break;

										loaded += value.byteLength;

										// Calculate and display download progress
										const progress = (loaded / total) * 100;
										$downloadProgress = progress;
										// console.log(`Download Progress: ${progress.toFixed(2)}%`);
									}
								});

								// Append the link to the body and trigger the download
								document.body.appendChild(link);
								link.click();

								// Remove the link from the body
								document.body.removeChild(link);
							}
							savePdf(mergedPDFBytes).then(() => {
								$fordgingStatus = 'done';
								const interval = setTimeout(() => {
									$documentIsExporting = false;
								}, 3000);
								alert('Document was saved successfully!');
							});
						});
					});
				}}
				class="py-3 px-4 !bg-gradient-to-tr from-amber-600 to-amber-400 text-white text-sm font-normal w-[85%] rounded-md"
			>
				Export Document
			</button>
		</div>

		{#if $documentIsExporting}
			<div transition:slide class="fordge:container flex items-center w-full h-fit p-2">
				<div class="fordge:statusImages relative w-[70px] h-[70px]">
					<div
						class="{$fordgingStatus === 'fordging' || $fordgingStatus === 'initial'
							? 'opacity-100 scale-[0.35] '
							: 'opacity-0 scale-0'} absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-fit h-fit flex justify-center items-center"
					>
						<SpinLoader3 />
					</div>

					<div
						class="{$fordgingStatus === 'exporting'
							? 'opacity-100 scale-[0.35]'
							: 'opacity-0 scale-0'} absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-fit h-fit flex justify-center items-center"
					>
						<SpinLoaderPrinter />
					</div>

					<div
						class="{$fordgingStatus === 'done'
							? 'opacity-100 scale-[0.35]'
							: 'opacity-0 scale-0'} absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-fit h-fit flex justify-center items-center"
					>
						<SpinLoaderPrinter />
					</div>
				</div>
				<div
					class="flex flex-col justify-center flex-1 {$fordgingStatus === 'fordging'
						? 'ml-3'
						: 'ml-1'}"
				>
					<div class="font-semibold text-lg text-slate-600 leading-3">Fordging...</div>
					<div class="">
						{#key $fordgingStatusDetail}
							<span
								transition:fade={{ duration: 300, easing: cubicInOut }}
								class="text-xs text-slate-400 leading-3">{$fordgingStatusDetail}</span
							>
						{/key}
					</div>
				</div>
			</div>
		{/if}

		<div
			id="editorTabsContain"
			class=" tabs:container bg-[#f1f1f1] relative flex contents_holder py-[10px] w-fit h-full scrollbar-thin overflow-auto
			{$activeEditorTab === 'statementTab'
				? ' translate-x-[0px] transition-[transform] duration-500 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]'
				: '  '}
			{$activeEditorTab === 'transactionTab'
				? ' -translate-x-[245px] transition-[transform] duration-500 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]'
				: '  '}
			{$activeEditorTab === 'componentsTab'
				? ' -translate-x-[490px] transition-[transform] duration-500 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]'
				: '  '}
			"
		>
			<div
				id="statementTab"
				class="test:absolute test:top-0 {$activeEditorTab === 'statementTab'
					? 'opacity-100'
					: 'opacity-75'} transition-all duration-500 ease-in-out test:left-0 flex flex-col space-y-2 items-center divide-y divide-solid divide-gray-300/50 test:divide-transparent w-[245px] h-fit"
			>
				<div
					class="flex bg-[#f5f5f5] justify-between space-x-2 items-center w-[95%] rounded-md h-fit m-0 p-3"
				>
					<div class="flex flex-col space-y-1 items-start w-full h-fit m-0">
						<div class="flex flex-col w-full space-y-0 text-slate-700/50 mb-3">
							<h2 class="font-semibold text-sm">Title/Openning balance</h2>
							<span class="font-normal text-[10px] leading-3 opacity-80"
								>Statement name and account starting balance</span
							>
						</div>
						<div
							class="flex flex-1 justify-between space-x-2 items-center w-full h-fit {transition}"
						>
							{#if $activeRecordID !== undefined || $activeRecordID !== null}
								<form action="" class=" flex flex-col w-full items-center space-y-2 h-fit">
									<Input
										class=""
										uuid={crypto.randomUUID()}
										field="statementTitle"
										bind:inputValue={$statements[0].title.value}
										placeholder={$statements[0].title.label}
										guidePlaceholder="Type now..."
										message="You messed up"
										identifier="statementTitle"
									>
										<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
									</Input>
									<Input
										class=""
										uuid={crypto.randomUUID()}
										field="statementID"
										bind:inputValue={$statements[0].id.value}
										placeholder={$statements[0].id.label}
										guidePlaceholder="Type now..."
										message="You messed up"
										identifier="statementID"
									>
										<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
									</Input>
									<!-- ? start Date -->
									<InputDate
										on:dateChanged={(e) => {}}
										isDisabled={false}
										which="statementDate"
										uuid={crypto.randomUUID()}
										field="statementDate"
										inputWidth="min-w-[100%]"
										bind:inputValue={$statements[0].duration.dueDate.value}
										placeholder="Due Date"
										guidePlaceholder="Type now..."
										message="You messed up"
									>
										<!-- <path
									slot="icon"
									d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
								/> -->
									</InputDate>
									<InputNumber
										on:numberChanged={(e) => {
											// console.log(e.detail.numberVal);
											computeTransactions($statements[0].newTransactions);
										}}
										bind:inputValue={$previousBalance}
										placeholder="Starting Balance"
										guidePlaceholder="Type now..."
										message="You messed up"
									>
										<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
									</InputNumber>
									<div
										id=""
										class="flex items-center space-x-2 w-[94%] h-fit p-2 bg-[#e9e9e9] rounded-lg overflow-x-auto scrollbar-thin"
									>
										{#each $currencies as currency, curIdx}
											<button
												id={'currencyIdentifier' + curIdx}
												type="button"
												class="flex justify-center items-center {$selectedCurrencyID === curIdx
													? 'bg-gradient-to-bl from-slate-600 to-slate-400 text-white'
													: 'bg-gradient-to-bl from-black/5 to-black/10'}  min-h-full min-w-[45px] py-2 px-3 rounded-md"
												on:click={(e) => {
													// const startDateElmt = document.getElementById('startdate');
													// startDateElmtIsON = !startDateElmtIsON;

													$selectedCurrencyID = curIdx;
													$statements[0].accountInfo.currency.value = $selectedCurrencyID;

													// console.log(e.currentTarget.parentNode.childNodes[0]);
												}}
											>
												<span
													class="font-semibold text-xs {$selectedCurrencyID === curIdx
														? 'text-white/90'
														: 'text-black/50'}">{$currencies[curIdx].symbol}</span
												>
												<!-- <svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 50 50"
													width="20"
													height="20"
													class="{$selectedCurrencyID === curIdx ? 'fill-white/90' : 'fill-black/50'} "
												>
													<path
														class="" d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 22.730469 33.269531 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6C29.382813 6 33.027344 9.121094 33.84375 13.25C33.867188 13.640625 34.121094 13.980469 34.484375 14.121094C34.851563 14.261719 35.265625 14.175781 35.542969 13.898438C35.824219 13.625 35.914063 13.210938 35.78125 12.84375C34.78125 7.792969 30.332031 4 25 4 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>

												</svg> -->
											</button>
										{/each}
									</div>
								</form>
							{/if}
						</div>
					</div>
				</div>

				<div
					class="flex bg-[#f5f5f5] justify-between space-x-2 items-center w-[95%] rounded-md h-fit m-0 p-3"
				>
					<div class="flex flex-col space-y-1 items-start w-full h-fit m-0">
						<div class="flex flex-col w-full space-y-0 text-slate-700/50 mb-3">
							<h2 class="font-semibold text-sm">Statement Period</h2>
							<span class="font-normal text-[10px] leading-3 opacity-80"
								>Set starting and ending date, Randomize date values in range</span
							>
						</div>
						<div
							class="flex flex-1 justify-between space-x-2 items-center w-full h-fit {transition}"
						>
							{#if $activeRecordID !== undefined || $activeRecordID !== null}
								<form action="" class=" flex flex-col w-full items-center space-y-2 h-fit">
									<div class="w-[95%] h-fit flex flex-col space-y-2 items-center">
										<div class="w-full h-full flex flex-1 justify-between items-center">
											<!-- ? start Date -->
											<InputDate
												on:dateChanged={(e) => {
													$statements[0].duration.dateRanges.dateDraftColection = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date($endDate)
														},
														{ step: 1 }
													);
													randomizeDateRange($statements[0].duration.dateRanges.dateDraftColection);

													$dateRange = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date($endDate)
														},
														{ step: 1 }
													);
													// randomizeDateRange($dateRange);

													// console.log($dateRange);

													// console.log(`This date is out of range: ${e.detail.dateVal}`);
													// if (
													// !isWithinInterval(new Date(e.detail.dateVal), {
													// 	start: new Date($startDate),
													// 	end: new Date($endDate)
													// })
													// ) {
													// alert(
													// 	`This date is out of range: ${lightFormat(
													// 		new Date(e.detail.dateVal),
													// 		'MM/dd/yyyy'
													// 	)}`
													// );
													// $newDateDraft[$activeRecordID] = lightFormat(
													// 	clamp(new Date(e.detail.dateVal), {
													// 		start: new Date($startDate),
													// 		end: new Date($endDate)
													// 	}),
													// 	'yyyy-MM-dd'
													// );
													// }
													// computeTransactions($statements[0].transactions);
													// console.log(e);
												}}
												isDisabled={startDateElmtIsON}
												which="startdate"
												uuid={$transactions[$activeRecordID]?.uuid}
												bind:field={$activeFieldName}
												bind:inputValue={$statements[0].duration.start.value}
												placeholder="Starting Date"
												guidePlaceholder="Type now..."
												message="You messed up"
											>
												<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
											</InputDate>

											<button
												type="button"
												class="flex justify-center items-center bg-gradient-to-bl from-black/5 to-black/10 min-h-full py-2 px-3 rounded-md"
												on:click={(e) => {
													// const startDateElmt = document.getElementById('startdate');
													startDateElmtIsON = !startDateElmtIsON;

													// console.log(e.currentTarget.parentNode.childNodes[0]);
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 50 50"
													width="20"
													height="20"
													class="fill-black/50"
												>
													<!-- unlocked -->
													<path
														class={startDateElmtIsON === false ? 'opacity-100' : 'opacity-0'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 22.730469 33.269531 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6C29.382813 6 33.027344 9.121094 33.84375 13.25C33.867188 13.640625 34.121094 13.980469 34.484375 14.121094C34.851563 14.261719 35.265625 14.175781 35.542969 13.898438C35.824219 13.625 35.914063 13.210938 35.78125 12.84375C34.78125 7.792969 30.332031 4 25 4 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
													<!-- locked -->
													<path
														class={startDateElmtIsON === false ? 'opacity-0' : 'opacity-100'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 27.078125 38.472656 23.519531 36 20.84375L36 15C36 8.9375 31.0625 4 25 4 Z M 25 6C29.984375 6 34 10.015625 34 15L34 19.03125C31.488281 17.136719 28.378906 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
												</svg>
											</button>
										</div>
										<div class="w-full h-full flex flex-1 justify-between items-center">
											<!-- ? End Date -->
											<InputDate
												on:dateChanged={(e) => {
													$statements[0].duration.dateRanges.dateDraftColection = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date(
																lightFormat(
																	new Date($statements[0].duration.end.value),
																	'yyyy/MM/dd'
																)
															)
														},
														{ step: 1 }
													);
													randomizeDateRange($statements[0].duration.dateRanges.dateDraftColection);

													$dateRange = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date(
																lightFormat(
																	new Date($statements[0].duration.end.value),
																	'yyyy/MM/dd'
																)
															)
														},
														{ step: 1 }
													);
													// randomizeDateRange($dateRange);

													// console.log($dateRange);

													// console.log(`This date is out of range: ${e.detail.dateVal}`);
													// if (
													// !isWithinInterval(new Date(e.detail.dateVal), {
													// 	start: new Date($startDate),
													// 	end: new Date($endDate)
													// })
													// ) {
													// alert(
													// 	`This date is out of range: ${lightFormat(
													// 		new Date(e.detail.dateVal),
													// 		'MM/dd/yyyy'
													// 	)}`
													// );
													// $newDateDraft[$activeRecordID] = lightFormat(
													// 	clamp(new Date(e.detail.dateVal), {
													// 		start: new Date($startDate),
													// 		end: new Date($endDate)
													// 	}),
													// 	'yyyy-MM-dd'
													// );
													// }
													// computeTransactions($statements[0].transactions);
													// console.log(e);
												}}
												isDisabled={endDateElmtIsON}
												which="enddate"
												uuid={$transactions[$activeRecordID]?.uuid}
												bind:field={$activeFieldName}
												bind:inputValue={$statements[0].duration.end.value}
												placeholder="Ending Date"
												guidePlaceholder="Type now..."
												message="You messed up"
											>
												<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
											</InputDate>

											<button
												type="button"
												class="flex justify-center items-center bg-gradient-to-bl from-black/5 to-black/10 min-h-full py-2 px-3 rounded-md"
												on:click={(e) => {
													// const startDateElmt = document.getElementById('startdate');
													endDateElmtIsON = !endDateElmtIsON;

													// console.log(e.currentTarget.parentNode.childNodes[0]);
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 50 50"
													width="20"
													height="20"
													class="fill-black/50"
												>
													<!-- unlocked -->
													<path
														class={endDateElmtIsON === false ? 'opacity-100' : 'opacity-0'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 22.730469 33.269531 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6C29.382813 6 33.027344 9.121094 33.84375 13.25C33.867188 13.640625 34.121094 13.980469 34.484375 14.121094C34.851563 14.261719 35.265625 14.175781 35.542969 13.898438C35.824219 13.625 35.914063 13.210938 35.78125 12.84375C34.78125 7.792969 30.332031 4 25 4 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
													<!-- locked -->
													<path
														class={endDateElmtIsON === false ? 'opacity-0' : 'opacity-100'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 27.078125 38.472656 23.519531 36 20.84375L36 15C36 8.9375 31.0625 4 25 4 Z M 25 6C29.984375 6 34 10.015625 34 15L34 19.03125C31.488281 17.136719 28.378906 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
												</svg>
											</button>
										</div>
									</div>

									<!--! randomize dates -->
									<div
										class="w-[95%] rounded-md h-fit test:bg-gray-300/20 test:bg-gray-50/70 test:bg-white/50 test:bg-transparent [#0e0e0e]"
									>
										<!-- <form action="" class=" flex flex-col items-center space-y-2 h-fit py-4"> -->
										<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<label
											on:mousedown={(e) => {
												let btn = document.getElementById('randomizedates');

												btn.style.rotate = '360deg';
												btn.style.scale = '0.6';
												let intervalID = setInterval(() => {
													btn.style.rotate = '720deg';
													btn.style.scale = '1';
													return clearInterval(intervalID);
												}, 400);
											}}
											on:click={() => {
												executeRandomizeDateRange();
											}}
											for="randomizeDates"
											class="flex justify-between items-center px-4 hover:cursor-pointer w-full h-[45px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
										>
											<input
												type="button"
												on:click={() => {
													executeRandomizeDateRange();
												}}
												name=""
												id="randomizeDates"
												class="sr-only"
											/>

											<div class="flex flex-col space-y-1">
												<h2 class="text-xs font-semibold -mt-2 text-white/90">Randomize Dates</h2>

												<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
													<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
														In selected range</span
													>
												</h2>
											</div>

											<h2 class="font-semibold text-lg leading-3 relative">
												<span
													class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-2
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
												>
													<!-- In -->
													<svg
														id="randomizedates"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 50 50"
														width="20"
														height="20"
														class="fill-white {transition}"
													>
														<path
															d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
														/>
													</svg>
												</span>
											</h2>
										</label>
										<!-- <path
								slot="icon"
								d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
							/> -->

										<!-- {#key $showMoreDescription}
							{#if $showMoreDescription === true}
								<Input
									bind:inputValue={$transactions[$activeRecordID]?.more}
									{identifier}
									placeholder="Detail"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!- <path
								slot="icon"
								d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
							/> ->
								</Input>
							{/if}
						{/key} -->
										<!-- </form> -->
									</div>
								</form>
							{/if}
						</div>
					</div>
				</div>

				<div
					class="flex bg-[#f5f5f5] justify-between space-x-2 items-center w-[95%] rounded-md h-fit m-0 p-3"
				>
					<div class="flex flex-col space-y-1 items-start w-full h-fit m-0">
						<div class="flex flex-col w-full space-y-0 text-slate-700/50">
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<h2
								on:mousedown={() => {
									$expandedAccountInformation = !$expandedAccountInformation;
								}}
								class="flex justify-between items-center font-semibold text-sm cursor-pointer"
							>
								<span class="">Account Information</span>
								<button
									type="button"
									class="flex justify-center items-center min-h-full p-1 rounded-md"
									on:mousedown={() => {
										$expandedAccountInformation = !$expandedAccountInformation;
									}}
								>
									<svg
										viewBox="0 0 50 50"
										width="10"
										height="10"
										class="fill-black/50 {$expandedAccountInformation === true
											? 'rotate-90'
											: 'rotate-0'} transition-all duration-300 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]"
									>
										<!-- unlocked -->
										<path
											d="M18.136719 3C17.875 3.003906 17.628906 3.105469 17.441406 3.289063L11.417969 9.265625C11.027344 9.65625 11.023438 10.289063 11.410156 10.679688L25.644531 25.03125L11.296875 39.265625C10.902344 39.65625 10.898438 40.289063 11.289063 40.679688L17.265625 46.703125C17.65625 47.097656 18.289063 47.101563 18.679688 46.710938L39.765625 25.796875C40.15625 25.40625 40.160156 24.773438 39.769531 24.378906L18.859375 3.296875C18.667969 3.101563 18.40625 2.996094 18.136719 3Z"
										/>
									</svg>
								</button>
							</h2>
							<span class="font-normal text-[10px] w-[35ch] leading-3 opacity-80"
								>All account essential details: account holder's name, account number, etc.
							</span>
						</div>
						<div
							class="flex flex-1 justify-between space-x-2 items-center w-full h-fit overflow-hidden {$expandedAccountInformation ===
							true
								? 'pt-3'
								: 'pt-0'} transition-[padding] duration-300 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]"
						>
							{#if $activeRecordID !== undefined || $activeRecordID !== null}
								{#if $expandedAccountInformation === true}
									<form
										transition:slide={{ duration: 300, easing: cubicOut }}
										action=""
										class=" flex flex-col w-full items-center space-y-2"
									>
										<Input
											uuid={crypto.randomUUID()}
											field="statementCustomerName"
											bind:inputValue={$statements[0].accountInfo.customer.name.value}
											placeholder={$statements[0].accountInfo.customer.name.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementCustomerName"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementAccountName"
											bind:inputValue={$statements[0].accountInfo.name.value}
											placeholder={$statements[0].accountInfo.name.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementAccountName"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementAccountNumber"
											bind:inputValue={$statements[0].accountInfo.number.value}
											placeholder={$statements[0].accountInfo.number.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementAccountNumber"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBranchName"
											bind:inputValue={$statements[0].accountInfo.branch.name.value}
											placeholder={$statements[0].accountInfo.branch.name.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBranchName"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementProductName"
											bind:inputValue={$statements[0].accountInfo.product.name.value}
											placeholder={$statements[0].accountInfo.product.name.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementProductName"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementPrintedBy"
											bind:inputValue={$statements[0].accountInfo.printedBy.name.value}
											placeholder={$statements[0].accountInfo.printedBy.name.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementPrintedBy"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementAccountType"
											bind:inputValue={$statements[0].accountInfo.accountType.value}
											placeholder={$statements[0].accountInfo.accountType.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementAccountType"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementAccountIBAN"
											bind:inputValue={$statements[0].accountInfo.IBAN.value}
											placeholder={$statements[0].accountInfo.IBAN.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementAccountIBAN"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementRef"
											bind:inputValue={$statements[0].footer.ref.value}
											placeholder={$statements[0].footer.ref.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementRef"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>

										<!-- <div class="flex flex-col space-y-4 mr-12 w-[100%]"> -->
										<InputTextarea
											bind:inputValue={$statements[0].note.value}
											error={false}
											placeholder={$statements[0].note.label}
											guidePlaceholder="Type now..."
											message="You messed up"
										>
											<path
												slot="icon"
												d="M21 2L21 5L23 5L23 6.0976562C12.355663 7.1082736 4 16.095631 4 27C4 38.579 13.421 48 25 48C36.579 48 46 38.579 46 27C46 16.095631 37.644337 7.1082736 27 6.0976562L27 5L29 5L29 2L21 2 z M 40.236328 5.1464844L38.230469 7.1523438L42.845703 11.767578L44.851562 9.7617188L40.236328 5.1464844 z M 15 16C15.25575 16 15.511531 16.097469 15.707031 16.292969L24.488281 25.074219C24.653281 25.031219 24.822 25 25 25C26.105 25 27 25.895 27 27C27 27.178 26.968781 27.346719 26.925781 27.511719L28.707031 29.292969C29.098031 29.683969 29.098031 30.316031 28.707031 30.707031C28.512031 30.902031 28.256 31 28 31C27.744 31 27.487969 30.902031 27.292969 30.707031L25.511719 28.925781C25.346719 28.968781 25.178 29 25 29C23.895 29 23 28.105 23 27C23 26.822 23.031219 26.653281 23.074219 26.488281L14.292969 17.707031C13.901969 17.316031 13.901969 16.683969 14.292969 16.292969C14.488469 16.097469 14.74425 16 15 16 z"
											/>
										</InputTextarea>
										<!-- </div> -->
									</form>
								{/if}
							{/if}
						</div>
					</div>
				</div>

				<div
					class="flex bg-[#f5f5f5] justify-between space-x-2 items-center w-[95%] rounded-md h-fit m-0 p-3"
				>
					<div class="flex flex-col space-y-1 items-start w-full h-fit m-0">
						<div class="flex flex-col w-full space-y-0 text-slate-700/50">
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<h2
								on:mousedown={() => {
									$expandedContactInformation = !$expandedContactInformation;
								}}
								class="flex justify-between items-center font-semibold text-sm cursor-pointer"
							>
								<span class="">Contact Information</span>
								<button
									type="button"
									class="flex justify-center items-center min-h-full p-1 rounded-md"
									on:mousedown={() => {
										$expandedContactInformation = !$expandedContactInformation;
									}}
								>
									<svg
										viewBox="0 0 50 50"
										width="10"
										height="10"
										class="fill-black/50 {$expandedContactInformation === true
											? 'rotate-90'
											: 'rotate-0'} transition-all duration-300 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]"
									>
										<!-- unlocked -->
										<path
											d="M18.136719 3C17.875 3.003906 17.628906 3.105469 17.441406 3.289063L11.417969 9.265625C11.027344 9.65625 11.023438 10.289063 11.410156 10.679688L25.644531 25.03125L11.296875 39.265625C10.902344 39.65625 10.898438 40.289063 11.289063 40.679688L17.265625 46.703125C17.65625 47.097656 18.289063 47.101563 18.679688 46.710938L39.765625 25.796875C40.15625 25.40625 40.160156 24.773438 39.769531 24.378906L18.859375 3.296875C18.667969 3.101563 18.40625 2.996094 18.136719 3Z"
										/>
									</svg>
								</button>
							</h2>
							<span class="font-normal text-[10px] w-[35ch] leading-3 opacity-80"
								>All Bank essential details: like Branch name, Branch ID, adress, etc.
							</span>
						</div>
						<div
							class="flex flex-1 justify-between space-x-2 items-center w-full h-fit overflow-hidden {$expandedContactInformation ===
							true
								? 'pt-3'
								: 'pt-0'} transition-[padding] duration-300 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]"
						>
							{#if $activeRecordID !== undefined || $activeRecordID !== null}
								{#if $expandedContactInformation === true}
									<form
										transition:slide={{ duration: 300, easing: cubicOut }}
										action=""
										class=" flex flex-col w-full items-center space-y-2"
									>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankName"
											bind:inputValue={$statements[0].bankInfo.name.value}
											placeholder={$statements[0].bankInfo.name.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankName"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankStreet"
											bind:inputValue={$statements[0].bankInfo.street.value}
											placeholder={$statements[0].bankInfo.street.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankStreet"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankAddress"
											bind:inputValue={$statements[0].bankInfo.address.value}
											placeholder={$statements[0].bankInfo.address.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankAddress"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankCity"
											bind:inputValue={$statements[0].bankInfo.city.value}
											placeholder={$statements[0].bankInfo.city.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankCity"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankCapital"
											bind:inputValue={$statements[0].bankInfo.capital.value}
											placeholder={$statements[0].bankInfo.capital.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankCapital"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankPOBox"
											bind:inputValue={$statements[0].bankInfo.poBox.value}
											placeholder={$statements[0].bankInfo.poBox.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankPOBox"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankFax"
											bind:inputValue={$statements[0].bankInfo.fax.value}
											placeholder={$statements[0].bankInfo.fax.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankFax"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankOfficeLine"
											bind:inputValue={$statements[0].bankInfo.call.office.value}
											placeholder={$statements[0].bankInfo.call.office.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankOfficeLine"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankMobile"
											bind:inputValue={$statements[0].bankInfo.call.mobile.value}
											placeholder={$statements[0].bankInfo.call.mobile.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankMobile"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankCallCenter"
											bind:inputValue={$statements[0].bankInfo.call.center.value}
											placeholder={$statements[0].bankInfo.call.center.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankCallCenter"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankEmail"
											bind:inputValue={$statements[0].bankInfo.email.value}
											placeholder={$statements[0].bankInfo.email.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankEmail"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
										<Input
											uuid={crypto.randomUUID()}
											field="statementBankWebsite"
											bind:inputValue={$statements[0].bankInfo.website.value}
											placeholder={$statements[0].bankInfo.website.label}
											guidePlaceholder="Type now..."
											message="You messed up"
											identifier="statementBankWebsite"
										>
											<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
										</Input>
									</form>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div
				id="transactionTab"
				class="test:absolute test:top-0 {$activeEditorTab === 'transactionTab'
					? 'opacity-100'
					: 'opacity-75 '} transition-all duration-500 ease-in-out test:left-0 flex flex-col space-y-2 items-center divide-y divide-solid divide-gray-300/50 test:divide-transparent w-[245px] h-fit"
			>
				<div
					class="shadow-sm w-[95%] rounded-sm h-fit test:bg-gray-300/20 test:bg-gray-50/70 bg-white/50 test:bg-transparent [#0e0e0e]"
				>
					<!-- ? <FilePond allowMultiple={true} max-files={3} server="/api" /> -->
					<form action="" class=" flex flex-col items-center space-y-2 h-fit py-4">
						<button
							type="button"
							id="addNewRecordButton"
							on:click={() => {
								// const
								let newRecordDate = lightFormat(
									new Date($statements[0].duration.end.value),
									'yyyy-MM-dd'
								);
								let createNewRecordDefaultCount = 1;

								if (
									$statements[0].configurations.dataManipulation.isCreateNewRecordRestricted ===
									true
								) {
									alert(
										'You should allow record creation in settings first to perform this operation'
									);
									return false;
								} else {
									// Retrieve the uuid and index of last record
									async function gatherNewRecordInfo(newTransactionStoreArray) {
										// Get transaction last record
										let storeSize = newTransactionStoreArray.length;

										if (storeSizepiece < 1) {
											// We have no transactions yet
											const newRecordInfo = 'NO_RECORD_FOUND';
											return newRecordInfo;
										} else {
											const newRecordInfo = newTransactionStoreArray[storeSize - 1];
											return {
												newRecordInfo: newRecordInfo,
												recordId: storeSize - 1
											};
										}
									}

									let newTransactionRecordsCollection = [];
									async function buildNewRecordCopies(size, date) {
										let newTransactionRecordPieces = [];
										for (let i = 1; i <= size; i++) {
											const newTransactionRecordPiece = {
												dataManipulationConfig: {
													isEditRecordRestricted: false,
													isDeleteRecordRestricted: false,
													isCopyRecordRestricted: false,
													isRandomizeRecordDatesRestricted: true,
													isRecordDuplicationRestricted: false
												},
												uuid: crypto.randomUUID(),
												ref: '',
												date: date,
												bookingDate: date,
												valueDate: date,
												branch: '',
												ope: '',
												narration: '',

												description: '',
												more: '',
												type: 'out',
												amount: 0.0,
												balance: $previousBalance ?? 0.0
											};

											newTransactionRecordPieces.push(newTransactionRecordPiece);
										}
										return newTransactionRecordPieces;
									}

									if ($statements[0].newTransactions.length < 1) {
										// count = count + 1;

										// if (count === 1) {
										// 	$statements[0].newTransactions[$activeRecordID].uuid = crypto.randomUUID();
										// }

										gatherNewRecordInfo($statements[0].newTransactions).then((data) => {
											if (data === 'NO_RECORD_FOUND') {
												// console.log('New record data no record: ');
												// console.log(data);
												// Create new record immediately
												buildNewRecordCopies(createNewRecordDefaultCount, newRecordDate).then(
													(newTransactionRecordPieces) => {
														// console.log('New Record Pieces: ');
														// console.log(newTransactionRecordPieces);
														newTransactionRecordsCollection = $statements[0].newTransactions.concat(
															newTransactionRecordPieces
														);

														computeTransactions(newTransactionRecordsCollection);
														// Make the last record active automatically

														// $selectedRowUUID = selectedRowUUID_;
														// $activeRecordID = 0;
													}
												);
												return;
											} else if (typeof data === 'object') {
												// Rtrieve and assign new record info
												newRecordDate = data.newRecordInfo.bookingDate;
												// console.log('New record data object: ');
												// console.log(data);
												// let recordId = data.recordId

												buildNewRecordCopies(createNewRecordDefaultCount, newRecordDate).then(
													(newTransactionRecordPieces) => {
														// console.log('New Record Pieces: ');
														// console.log(newTransactionRecordPieces);
														newTransactionRecordsCollection = $statements[0].newTransactions.concat(
															newTransactionRecordPieces
														);

														computeTransactions(newTransactionRecordsCollection);
														// Make the last record active automatically

														// $selectedRowUUID = selectedRowUUID_;
														// $activeRecordID = recordId;
													}
												);
											} else {
												alert('Oop! Something went wrong');
											}
										});
									} else {
										let selectedRowUUID_ = $statements[0].newTransactions[$activeRecordID].uuid;
										let activeRecordID_ = $activeRecordID;

										count = count + 1;

										if (count === 1) {
											$statements[0].newTransactions[$activeRecordID].uuid = crypto.randomUUID();
										}

										gatherNewRecordInfo($statements[0].newTransactions).then((data) => {
											if (data === 'NO_RECORD_FOUND') {
												// console.log('New record data no record: ');
												// console.log(data);
												// Create new record immediately
												buildNewRecordCopies(createNewRecordDefaultCount, newRecordDate).then(
													(newTransactionRecordPieces) => {
														// console.log('New Record Pieces: ');
														// console.log(newTransactionRecordPieces);
														newTransactionRecordsCollection = $statements[0].newTransactions.concat(
															newTransactionRecordPieces
														);

														computeTransactions(newTransactionRecordsCollection);
														// Make the last record active automatically

														// $selectedRowUUID = selectedRowUUID_;
														// $activeRecordID = 0;
													}
												);
												return;
											} else if (typeof data === 'object') {
												// Rtrieve and assign new record info
												newRecordDate = data.newRecordInfo.bookingDate;
												// console.log('New record data object: ');
												// console.log(data);
												// let recordId = data.recordId

												buildNewRecordCopies(createNewRecordDefaultCount, newRecordDate).then(
													(newTransactionRecordPieces) => {
														// console.log('New Record Pieces: ');
														// console.log(newTransactionRecordPieces);
														newTransactionRecordsCollection = $statements[0].newTransactions.concat(
															newTransactionRecordPieces
														);

														computeTransactions(newTransactionRecordsCollection);
														// Make the last record active automatically

														// $selectedRowUUID = selectedRowUUID_;
														// $activeRecordID = recordId;
													}
												);
											} else {
												alert('Oop! Something went wrong');
											}
										});

										//++++++++++++++++++++++++++++++++++++++++
										// }
									}
								}
							}}
							class="p-2 bg-lime-600 w-[90%] text-white font-semibold rounded-md"
						>
							New Record
						</button>

						{#if $statements[0].newTransactions.length > 0}
							<div
								class="w-[100%] px-5 h-fit flex flex-col justify-center items-center space-y-2 mx-auto"
							>
								<InputDate
									on:dateChanged={(e) => {
										// console.log(`This date is out of range: ${e.detail.dateVal}`);
										if (
											!isWithinInterval(new Date(e.detail.dateVal), {
												start: new Date($startDate),
												end: new Date($endDate)
											})
										) {
											alert(
												`This date is out of range: ${lightFormat(
													new Date(e.detail.dateVal),
													'MM/dd/yyyy'
												)}`
											);
											$statements[0].newTransactions[$activeRecordID].date = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($startDate),
													end: new Date($endDate)
												}),
												'yyyy-MM-dd'
											);
											$statements[0].duration.dateRanges.newRange.date[$activeRecordID] =
												lightFormat(
													clamp(new Date(e.detail.dateVal), {
														start: new Date($startDate),
														end: new Date($endDate)
													}),
													'yyyy-MM-dd'
												);
											$newDateDraft[$activeRecordID] = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($startDate),
													end: new Date($endDate)
												}),
												'yyyy-MM-dd'
											);
										}

										// computeTransactions($statements[0].transactions);
										// console.log(e);
									}}
									which="date"
									uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
									bind:field={$activeFieldName}
									bind:inputValue={$statements[0].newTransactions[$activeRecordID].date}
									placeholder="Date"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!-- <path
										slot="icon"
										d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
									/> -->
								</InputDate>
								<InputDate
									on:dateChanged={(e) => {
										// console.log(`This date is out of range: ${e.detail.dateVal}`);
										if (
											!isWithinInterval(new Date(e.detail.dateVal), {
												start: new Date($statements[0].duration.start.value),
												end: new Date($statements[0].duration.end.value)
											})
										) {
											alert(
												`This date is out of range: ${lightFormat(
													new Date(e.detail.dateVal),
													'MM/dd/yyyy'
												)}`
											);
											$statements[0].newTransactions[$activeRecordID].bookingDate = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($statements[0].duration.start.value),
													end: new Date($statements[0].duration.end.value)
												}),
												'yyyy-MM-dd'
											);
											$statements[0].duration.dateRanges.newRange.bookingDate[$activeRecordID] =
												lightFormat(
													clamp(new Date(e.detail.dateVal), {
														start: new Date($statements[0].duration.start.value),
														end: new Date($statements[0].duration.end.value)
													}),
													'yyyy-MM-dd'
												);
											$newBookingDateDraft[$activeRecordID] = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($statements[0].duration.start.value),
													end: new Date($statements[0].duration.end.value)
												}),
												'yyyy-MM-dd'
											);

											$transactions[$activeRecordID].bookingDate = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($statements[0].duration.start.value),
													end: new Date($statements[0].duration.end.value)
												}),
												'yyyy-MM-dd'
											);

											$newBookingDateDraft[$activeRecordID] = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($statements[0].duration.start.value),
													end: new Date($statements[0].duration.end.value)
												}),
												'yyyy-MM-dd'
											);

											// newTransactions[$activeRecordID].bookingDate =
											// $newBookingDateDraft[$activeRecordID];
											//$transactions = newTransactions;
											// computeTransactions(newTransactions);
										}

										$statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
											return new Date(a.bookingDate) - new Date(b.bookingDate);
										});

										// $statements.newTransactions[$activeRecordID].date = lightFormat(
										// 	new Date(e.detail.dateVal),
										// 	'yyyy-MM-dd'
										// );
										// $statements.newTransactions[$activeRecordID].bookingDate = lightFormat(
										// 	new Date(e.detail.dateVal),
										// 	'yyyy-MM-dd'
										// );
										// $statements.newTransactions[$activeRecordID].valueDate = lightFormat(
										// 	new Date(e.detail.dateVal),
										// 	'yyyy-MM-dd'
										// );

										// let draftColection = $statements[0].duration.dateRanges.dateDraftColection;
										// let newTransactionsColection = $statements[0].newTransactions;

										// let draftColectionSize = draftColection.length;
										// let newTransactionsColectionSize = newTransactionsColection.length;

										// if (newTransactionsColectionSize > 1) {
										// 	draftColection.forEach((record, index) => {
										// 		if (draftColectionSize > newTransactionsColectionSize) {
										// 			return;
										// 		} else {
										// 			newTransactionsColection[index].date = record;
										// 			newTransactionsColection[index].bookingDate = record;
										// 			newTransactionsColection[index].valueDate = record;

										// 			$statements[0].duration.dateRanges.newRange.date[index] = record;
										// 			$statements[0].duration.dateRanges.newRange.bookingDate[index] = record;
										// 			$statements[0].duration.dateRanges.newRange.valueDate[index] = record;
										// 		}
										// 	});
										// }

										// fromSortedTransactions = newTransactionsColection;

										// $statements[0].newTransactions.length > 1
										// 	? syncDates(
										// 			$statements[0].duration.dateRanges.dateDraftColection,
										// 			$statements[0].newTransactions
										// 	  )
										// 	: '';

										// $newBookingDateDraft = $newBookingDateDraft.sort((a, b) => a - b);

										// newTransactions[$activeRecordID].bookingDate =
										// 	$newBookingDateDraft[$activeRecordID];
										// $transactions[$activeRecordID]?.bookingDate =
										// 	$newBookingDateDraft[$activeRecordID];
										// $statements[0].newTransactions[$activeRecordID]?.bookingDate =
										// 	$newBookingDateDraft[$activeRecordID];

										// document.getElementById($activeFieldName).blur();

										const capturedPreviousActiveRecordID = $activeRecordID;
										const interval = setInterval(() => {
											// console.log('2 Seconds after update!');
											// $statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
											// 	return new Date(a.bookingDate) - new Date(b.bookingDate);
											// });

											return clearInterval(interval);
										}, 2000);

										// computeTransactions(fromSortedTransactions);
										// $statements[0].newTransactions[$activeRecordID]?.bookingDate

										// console.log($statements[0].transactions);
										// console.log(newTransactions);
										// console.log(fromSortedTransactions);
										// console.log(
										// 	newTransactions.sort((a, b) => {
										// 		return new Date(a.bookingDate) - new Date(b.bookingDate);
										// 	})
										// );
									}}
									which="bookingDate"
									uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
									bind:field={$activeFieldName}
									bind:inputValue={$statements[0].newTransactions[$activeRecordID].bookingDate}
									placeholder="Booking Date"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!-- <path
										slot="icon"
										d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
									/> -->
								</InputDate>
								<InputDate
									on:dateChanged={(e) => {
										// console.log(`This date is out of range: ${e.detail.dateVal}`);
										if (
											!isWithinInterval(new Date(e.detail.dateVal), {
												start: new Date($statements[0].duration.start.value),
												end: new Date($statements[0].duration.end.value)
											})
										) {
											alert(
												`This date is out of range: ${lightFormat(
													new Date(e.detail.dateVal),
													'MM/dd/yyyy'
												)}`
											);
											$statements[0].newTransactions[$activeRecordID].valueDate = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($statements[0].duration.start.value),
													end: new Date($statements[0].duration.end.value)
												}),
												'yyyy-MM-dd'
											);
											$statements[0].duration.dateRanges.newRange.valueDate[$activeRecordID] =
												lightFormat(
													clamp(new Date(e.detail.dateVal), {
														start: new Date($statements[0].duration.start.value),
														end: new Date($statements[0].duration.end.value)
													}),
													'yyyy-MM-dd'
												);
											$newValueDateDraft[$activeRecordID] = lightFormat(
												clamp(new Date(e.detail.dateVal), {
													start: new Date($statements[0].duration.start.value),
													end: new Date($statements[0].duration.end.value)
												}),
												'yyyy-MM-dd'
											);
										}

										// computeTransactions(transactions);
										// console.log(e);
									}}
									which="valueDate"
									uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
									bind:field={$activeFieldName}
									bind:inputValue={$statements[0].newTransactions[$activeRecordID].valueDate}
									placeholder="Value Date"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!-- <path
										slot="icon"
										d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
									/> -->
								</InputDate>
								<InputRef
									uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
									bind:field={$activeFieldName}
									bind:inputValue={$statements[0].newTransactions[$activeRecordID].ref}
									placeholder="Ref_No."
									guidePlaceholder="Type now..."
									message="You messed up"
									identifier="ref"
								>
									<!-- <path
										slot="icon"
										d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
									/> -->
								</InputRef>
							</div>

							<InputNumberAmount
								on:message={(e) => {
									if (e.detail.numberVal === '' || e.detail.numberVal === null) {
										alert(e.detail.numberVal);

										// $statements[0].transactions[$activeRecordID].amount = 0;
										// computeTransactions($statements[0].transactions);
									}
								}}
								which={$statements[0].newTransactions[$activeRecordID]?.type}
								uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
								bind:field={$activeFieldName}
								bind:inputValue={$statements[0].newTransactions[$activeRecordID].amount}
								placeholder="Amount"
								guidePlaceholder="Type now..."
								message="You messed up"
							>
								<!-- <path
									slot="icon"
									d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
								/> -->
							</InputNumberAmount>

							<Input
								uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
								bind:field={$activeFieldName}
								bind:inputValue={$statements[0].newTransactions[$activeRecordID].description}
								placeholder="Description"
								guidePlaceholder="Type now..."
								message="You messed up"
								identifier="more"
							>
								<!-- <path
									slot="icon"
									d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
								/> -->
							</Input>
							<Input
								uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
								bind:field={$activeFieldName}
								bind:inputValue={$statements[0].newTransactions[$activeRecordID].branch}
								placeholder="Branch"
								guidePlaceholder="Type now..."
								message="You messed up"
								identifier="branch"
							>
								<!-- <path
									slot="icon"
									d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
								/> -->
							</Input>
							<Input
								uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
								bind:field={$activeFieldName}
								bind:inputValue={$statements[0].newTransactions[$activeRecordID].ope}
								placeholder="Ope"
								guidePlaceholder="Type now..."
								message="You messed up"
								identifier="ope"
							>
								<!-- <path
									slot="icon"
									d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
								/> -->
							</Input>
							<Input
								uuid={$statements[0].newTransactions[$activeRecordID]?.uuid}
								bind:field={$activeFieldName}
								bind:inputValue={$statements[0].newTransactions[$activeRecordID].narration}
								placeholder="Narration"
								guidePlaceholder="Type now..."
								message="You messed up"
								identifier="narration"
							>
								<!-- <path
									slot="icon"
									d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
								/> -->
							</Input>

							<button
								type="button"
								on:click={() => {
									if ($statements[0].newTransactions.length === 1) {
										$statements[0].newTransactions = [];
										computeTransactions($statements[0].newTransactions);
										return;
									}

									let recordToDeleteIndex = $activeRecordID;
									const filteredAfterDelete = $statements[0].newTransactions.filter((record) => {
										if (record.uuid !== $statements[0].newTransactions[recordToDeleteIndex].uuid) {
											return true;
										}
									});

									computeTransactions(filteredAfterDelete);

									let transactionRecordsLength = $statements[0].newTransactions.length;
									// console.log(`recordToDeleteIndex: ${recordToDeleteIndex}`);
									// console.log(`transactionRecordsLength: ${transactionRecordsLength}`);
									if (recordToDeleteIndex === transactionRecordsLength) {
										// console.log('it is true');
										$activeRecordID = transactionRecordsLength - 1;
										$selectedRowUUID = $statements[0].newTransactions[$activeRecordID].uuid;
										// console.log(filteredAfterDelete);
									} else {
										$activeRecordID = recordToDeleteIndex;
										$selectedRowUUID = $statements[0].newTransactions[$activeRecordID].uuid;
									}
								}}
								class="p-2 bg-red-600 w-[90%] text-white font-semibold rounded-md"
								>Delete Record</button
							>


						
								<InputNumber
									on:numberChanged={(e) => {
										// console.log(e.detail.numberVal);
										computeTransactions($statements[0].newTransactions);
									}}
									bind:inputValue={$bundleSizeStore}
									placeholder="Duplicate Copies"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!-- <path
										slot="icon"
										d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
									/> -->
								</InputNumber>

								<button
								type="button"
								on:click={() => {
									// let id = crypto.randomUUID();
									let bundleSize = $bundleSizeStore;
									let selectedRowUUID_ = $statements[0].newTransactions[$activeRecordID].uuid;
									let activeRecordID_ = $activeRecordID;

									let recordToDuplicateIndex = activeRecordID_;

									if (
										$statements[0].configurations.dataManipulation.isRecordDuplicationRestricted ===
										true
									) {
										alert(
											'You should allow record duplication in settings first to perform this operation'
										);
										return false;
									} else {
										if (
											$statements[0].newTransactions[activeRecordID_].dataManipulationConfig
												.isRecordDuplicationRestricted === true
										) {
											alert(
												'This record can not be duplicated. You should allow record duplication first to perform this operation'
											);
											return false;
										} else {
											count = count + 1;

											let recordToDuplicate =
												$statements[0].newTransactions[recordToDuplicateIndex];
											const duplicateCopy = $statements[0].newTransactions.filter((record) => {
												if (
													record.uuid ===
													$statements[0].newTransactions[recordToDuplicateIndex].uuid
												) {
													return true;
												}
											});

											//++++++++++++++++++++++++++++++++++++++++

											// $statements[0].transactions.push(newTransactionSegment);
											if (count === 1) {
												$statements[0].newTransactions[$activeRecordID].uuid = crypto.randomUUID();
											}

											let newCollectionWithDuplicateBundle = [];
											async function buildDuplicateCopies(bundleSize) {
												let duplicateBundle = [];
												for (let i = 1; i <= bundleSize; i++) {
													let newTransactionSegment = {
														dataManipulationConfig: duplicateCopy[0].dataManipulationConfig,
														uuid: crypto.randomUUID(),
														ref: duplicateCopy[0].ref,
														date: duplicateCopy[0].date,
														bookingDate: duplicateCopy[0].bookingDate,
														valueDate: duplicateCopy[0].valueDate,
														branch: duplicateCopy[0].branch,
														ope: duplicateCopy[0].ope,
														narration: duplicateCopy[0].narration,
														description: duplicateCopy[0].description,
														more: duplicateCopy[0].more,
														type: duplicateCopy[0].type,
														amount: duplicateCopy[0].amount,
														balance: $previousRowBalance.toFixed(2)
													};

													duplicateBundle.push(newTransactionSegment);
												}
												return duplicateBundle;
											}

											buildDuplicateCopies(bundleSize).then((duplicateBundle) => {
												// console.log('Duplicate Bundle: ');
												// console.log(duplicateBundle);
												newCollectionWithDuplicateBundle =
													$statements[0].newTransactions.concat(duplicateBundle);
												// $statements[0].newTransactions = newCollectionWithDuplicateBundle;
												// $statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
												// 	return new Date(a.bookingDate) - new Date(b.bookingDate);
												// });

												computeTransactions(newCollectionWithDuplicateBundle);
												$selectedRowUUID = selectedRowUUID_;
												$activeRecordID = recordToDuplicateIndex;
											});

											//++++++++++++++++++++++++++++++++++++++++
										}
									}

									// if (selectedRowUUID_ !== id) {
									// 	$statements[0].newTransactions.push(selectedCopy);
									// 	if (count > 1) {
									// 		$statements[0].newTransactions = uniqBy($statements[0].newTransactions, 'uuid');
									// 	}
									// 	computeTransactions($statements[0].newTransactions);
									// }

									// const fixDuplicateUUIDColision = new Set($statements[0].newTransactions);
									// const fixDuplicateUUIDColision = uniqWith($statements[0].newTransactions, isEqual);
									// $statements[0].newTransactions = [...fixDuplicateUUIDColision];
									// console.log('Array from lodash: ');
									// console.log(fixDuplicateUUIDColision);

									// $statements[0].newTransactions = [];
									// $statements[0].newTransactions.push(objectArray);
									// $statements[0].newTransactions = objectArray;
									// console.log('Array from: ');
									// console.log(objectArray);

									// executeDuplicateCopy(fixDuplicateUUIDColision);
									// const interval = setInterval(() => {
									// 	console.log('2 Seconds after update!');
									// 	// const objectArray = [];
									// 	// for (const obj of fixDuplicateUUIDColision) {
									// 	// 	// $statements[0].newTransactions.push(obj);
									// 	// 	objectArray.push(obj);
									// 	// }
									// 	// console.log('Array from: ');
									// 	// console.log(objectArray);

									// 	const data = Array.from(fixDuplicateUUIDColision);

									// 	const newItems = [];
									// 	data.forEach((item) => {
									// 		newItems.push(item);
									// 	});
									// 	$statements[0].newTransactions.push(newItems);
									// 	// $statements[0].newTransactions.push(objectArray);

									// 	$statements[0].newTransactions = $statements[0].newTransactions.sort((a, b) => {
									// 		return new Date(a.bookingDate) - new Date(b.bookingDate);
									// 	});
									// const getIndexForDuplicateCopy = $statements[0].newTransactions.indexOf(
									// 	duplicateCopy[0]
									// );

									// 	computeTransactions($statements[0].newTransactions);
									// $selectedRowUUID = duplicateCopy[0].uuid;
									// $activeRecordID = getIndexForDuplicateCopy;

									// 	return clearInterval(interval);
									// }, 250);

									// duplicateCopy[0].valueDate;
									// console.log(getIndexForDuplicateCopy);
									// console.log(filteredAfterDelete);
								}}
								class="p-2 bg-red-600 w-[90%] text-white font-semibold rounded-md"
								>Duplicate Record</button
							>

 						




							
							<!-- {/if} -->
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<label
								on:click={(e) => {
									// console.log(e);

									if ($statements[0].newTransactions[$activeRecordID].type === 'in') {
										$statements[0].newTransactions[$activeRecordID].type = 'out';
										//computeTransactions($statements[0].newTransactions);
									} else {
										$statements[0].newTransactions[$activeRecordID].type = 'in';
										//computeTransactions($statements[0].newTransactions);
									}
								}}
								for="changeRecordType"
								class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

									bg-gradient-to-tr from-sky-600 to-sky-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
								rounded-sm hover:shadow-lg {transition}
								"
							>
								<input
									type="button"
									on:click={(e) => {
										// console.log(e);

										if ($statements[0].newTransactions[$activeRecordID].type === 'in') {
											$statements[0].newTransactions[$activeRecordID].type = 'out';
											//computeTransactions($statements[0].newTransactions);
										} else {
											$statements[0].newTransactions[$activeRecordID].type = 'in';
											//computeTransactions($statements[0].newTransactions);
										}
									}}
									name=""
									id="changeRecordType"
									class="sr-only"
								/>

								<div class="flex flex-col space-y-1">
									<h2 class="text-xs font-semibold -mt-2 text-white/90">Record Type</h2>
									<h2 class="font-light text-[10px] text-white/90 w-[30ch] relative">
										<span
											class="absolute top-1/2 left-0 -translate-y-1/2 {$statements[0]
												.newTransactions[$activeRecordID]?.type === 'in'
												? 'opacity-100'
												: 'opacity-0'} {transition}"
										>
											Deposit</span
										>
										<span
											class="absolute top-1/2 left-0 -translate-y-1/2 {$statements[0]
												.newTransactions[$activeRecordID]?.type === 'out'
												? 'opacity-100'
												: 'opacity-0'} {transition}"
											>Withdrowal
										</span>
									</h2>
								</div>

								<h2 class="font-semibold text-lg leading-3 relative">
									<span
										class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
										px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
										{$statements[0].newTransactions[$activeRecordID]?.type === 'in'
											? 'opacity-100 scale-100'
											: 'opacity-0 scale-0'} {transition}"
									>
										<!-- In -->
										IN
									</span>
									<span
										class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
										px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
										{$statements[0].newTransactions[$activeRecordID]?.type === 'out'
											? 'opacity-100 scale-100'
											: 'opacity-0 scale-0'} {transition}"
										>OUT
									</span>
								</h2>
							</label>

							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<label
								on:click={() => {
									if ($showMoreDescription === true) {
										// identifierField?.click();
									}
								}}
								for="showMore"
								class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]
								{$showMoreDescription === true
									? 'bg-gradient-to-tr from-sky-600 to-sky-400 text-white '
									: 'bg-gradient-to-tr from-gray-400 to-gray-200 text-slate-700 '}
								rounded-sm hover:shadow-lg {transition}
								"
							>
								<input
									type="checkbox"
									on:change={(e) => {
										// console.log(e);
									}}
									bind:checked={$showMoreDescription}
									name=""
									id="showMore"
									class="sr-only"
								/>

								<div class="flex flex-col space-y-1">
									<h2 class="text-xs font-semibold -mt-2 text-white/90">Detail</h2>
									<h2 class="font-light text-[10px] text-white/90 w-[30ch] relative">
										<span
											class="absolute top-1/2 left-0 -translate-y-1/2 {$showMoreDescription === true
												? 'opacity-100'
												: 'opacity-0'} {transition}"
										>
											Showing more</span
										>
										<span
											class="absolute top-1/2 left-0 -translate-y-1/2 {$showMoreDescription ===
											false
												? 'opacity-100'
												: 'opacity-0'} {transition}"
											>Show more
										</span>
									</h2>
								</div>

								<h2 class="font-semibold text-lg leading-3 relative">
									<span
										class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
										px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
										{$showMoreDescription === true ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} {transition}"
									>
										ON</span
									>
									<span
										class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
										px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-slate-400
										{$showMoreDescription === false ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} {transition}"
										>OFF
									</span>
								</h2>
							</label>

							{#key $showMoreDescription}
								{#if $showMoreDescription === true}
									<Input
										bind:inputValue={$statements[0].newTransactions[$activeRecordID].more}
										{identifier}
										placeholder="Detail"
										guidePlaceholder="Type now..."
										message="You messed up"
									>
										<!-- <path
									slot="icon"
									d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
								/> -->
									</Input>
								{/if}
							{/key}
						{/if}
					</form>
				</div>
			</div>

			<div
				id="componentsTab"
				class="test:absolute test:top-0 {$activeEditorTab === 'componentsTab'
					? 'opacity-100'
					: 'opacity-75 '} transition-all duration-500 ease-in-out test:left-0 flex flex-col space-y-2 items-center divide-y divide-solid divide-gray-300/50 test:divide-transparent w-[245px] h-fit"
			>
				<div
					class="flex bg-gradient-to-bl from-neutral-50/5 to-neutral-50/10 justify-between space-x-2 items-center w-[95%] rounded-md h-fit m-0 p-3"
				>
					<div class="flex flex-col space-y-1 items-start w-full h-fit m-0">
						<div class="flex flex-col w-full space-y-0 text-slate-700/50 mb-3">
							<h2 class="font-semibold text-l5">Statement Dates</h2>
							<span class="font-normal text-xs opacity-80"
								>Set starting and ending date, Randomize date values in range</span
							>
						</div>
						<div
							class="flex flex-1 justify-between space-x-2 items-center w-full h-fit {transition}"
						>
							{#if $activeRecordID !== undefined || $activeRecordID !== null}
								<form action="" class=" flex flex-col w-full items-center space-y-2 h-fit">
									<!-- <input
									type="range"
									on:change={(e) => {
										// console.log(e);
									}}
									bind:value={$zoomLevel}
									min="0"
									max="2"
									step="0.1"
									name=""
									id=""
									class="appearance-none w-[90%] h-2 bg-gray-200 rounded-lg cursor-pointer range-sm"
								/> -->

									<InputNumberAmount
										on:message={(e) => {
											if (e.detail.numberVal === '' || e.detail.numberVal === null) {
												alert(e.detail.numberVal);

												// $statements[0].transactions[$activeRecordID].amount = 0;
												// computeTransactions($statements[0].transactions);
											}
										}}
										which=""
										uuid={crypto.randomUUID()}
										field="inputRowNumber"
										bind:inputValue={$statements[0].configurations.pageSettings.size}
										placeholder="Row Number"
										guidePlaceholder="Type now..."
										message="You messed up"
									>
										<!-- <path
										slot="icon"
										d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
									/> -->
									</InputNumberAmount>

									<div class="w-[95%] h-fit flex flex-col space-y-2 items-center">
										<div class="w-full h-full flex flex-1 justify-between items-center">
											<!-- ? start Date -->
											<InputDate
												on:dateChanged={(e) => {
													$statements[0].duration.dateRanges.dateDraftColection = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date($endDate)
														},
														{ step: 1 }
													);
													randomizeDateRange($statements[0].duration.dateRanges.dateDraftColection);

													$dateRange = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date($endDate)
														},
														{ step: 1 }
													);
													// randomizeDateRange($dateRange);

													// console.log($dateRange);

													// console.log(`This date is out of range: ${e.detail.dateVal}`);
													// if (
													// !isWithinInterval(new Date(e.detail.dateVal), {
													// 	start: new Date($startDate),
													// 	end: new Date($endDate)
													// })
													// ) {
													// alert(
													// 	`This date is out of range: ${lightFormat(
													// 		new Date(e.detail.dateVal),
													// 		'MM/dd/yyyy'
													// 	)}`
													// );
													// $newDateDraft[$activeRecordID] = lightFormat(
													// 	clamp(new Date(e.detail.dateVal), {
													// 		start: new Date($startDate),
													// 		end: new Date($endDate)
													// 	}),
													// 	'yyyy-MM-dd'
													// );
													// }
													// computeTransactions($statements[0].transactions);
													// console.log(e);
												}}
												isDisabled={startDateElmtIsON}
												which="startdate"
												uuid={$transactions[$activeRecordID]?.uuid}
												bind:field={$activeFieldName}
												bind:inputValue={$statements[0].duration.start.value}
												placeholder="Starting Date"
												guidePlaceholder="Type now..."
												message="You messed up"
											>
												<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
											</InputDate>

											<button
												type="button"
												class="flex justify-center items-center bg-gradient-to-bl from-black/5 to-black/10 min-h-full py-2 px-3 rounded-md"
												on:click={(e) => {
													// const startDateElmt = document.getElementById('startdate');
													startDateElmtIsON = !startDateElmtIsON;

													// console.log(e.currentTarget.parentNode.childNodes[0]);
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 50 50"
													width="20"
													height="20"
													class="fill-black/50"
												>
													<!-- unlocked -->
													<path
														class={startDateElmtIsON === false ? 'opacity-100' : 'opacity-0'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 22.730469 33.269531 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6C29.382813 6 33.027344 9.121094 33.84375 13.25C33.867188 13.640625 34.121094 13.980469 34.484375 14.121094C34.851563 14.261719 35.265625 14.175781 35.542969 13.898438C35.824219 13.625 35.914063 13.210938 35.78125 12.84375C34.78125 7.792969 30.332031 4 25 4 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
													<!-- locked -->
													<path
														class={startDateElmtIsON === false ? 'opacity-0' : 'opacity-100'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 27.078125 38.472656 23.519531 36 20.84375L36 15C36 8.9375 31.0625 4 25 4 Z M 25 6C29.984375 6 34 10.015625 34 15L34 19.03125C31.488281 17.136719 28.378906 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
												</svg>
											</button>
										</div>
										<div class="w-full h-full flex flex-1 justify-between items-center">
											<!-- ? End Date -->
											<InputDate
												on:dateChanged={(e) => {
													$statements[0].duration.dateRanges.dateDraftColection = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date(
																lightFormat(
																	new Date($statements[0].duration.end.value),
																	'yyyy/MM/dd'
																)
															)
														},
														{ step: 1 }
													);
													randomizeDateRange($statements[0].duration.dateRanges.dateDraftColection);

													$dateRange = eachDayOfInterval(
														{
															start: new Date(
																lightFormat(
																	new Date($statements[0].duration.start.value),
																	'yyyy/MM/dd'
																)
															),
															end: new Date(
																lightFormat(
																	new Date($statements[0].duration.end.value),
																	'yyyy/MM/dd'
																)
															)
														},
														{ step: 1 }
													);
													// randomizeDateRange($dateRange);

													// console.log($dateRange);

													// console.log(`This date is out of range: ${e.detail.dateVal}`);
													// if (
													// !isWithinInterval(new Date(e.detail.dateVal), {
													// 	start: new Date($startDate),
													// 	end: new Date($endDate)
													// })
													// ) {
													// alert(
													// 	`This date is out of range: ${lightFormat(
													// 		new Date(e.detail.dateVal),
													// 		'MM/dd/yyyy'
													// 	)}`
													// );
													// $newDateDraft[$activeRecordID] = lightFormat(
													// 	clamp(new Date(e.detail.dateVal), {
													// 		start: new Date($startDate),
													// 		end: new Date($endDate)
													// 	}),
													// 	'yyyy-MM-dd'
													// );
													// }
													// computeTransactions($statements[0].transactions);
													// console.log(e);
												}}
												isDisabled={endDateElmtIsON}
												which="enddate"
												uuid={$transactions[$activeRecordID]?.uuid}
												bind:field={$activeFieldName}
												bind:inputValue={$statements[0].duration.end.value}
												placeholder="Ending Date"
												guidePlaceholder="Type now..."
												message="You messed up"
											>
												<!-- <path
											slot="icon"
											d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
										/> -->
											</InputDate>

											<button
												type="button"
												class="flex justify-center items-center bg-gradient-to-bl from-black/5 to-black/10 min-h-full py-2 px-3 rounded-md"
												on:click={(e) => {
													// const startDateElmt = document.getElementById('startdate');
													endDateElmtIsON = !endDateElmtIsON;

													// console.log(e.currentTarget.parentNode.childNodes[0]);
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 50 50"
													width="20"
													height="20"
													class="fill-black/50"
												>
													<!-- unlocked -->
													<path
														class={endDateElmtIsON === false ? 'opacity-100' : 'opacity-0'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 22.730469 33.269531 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6C29.382813 6 33.027344 9.121094 33.84375 13.25C33.867188 13.640625 34.121094 13.980469 34.484375 14.121094C34.851563 14.261719 35.265625 14.175781 35.542969 13.898438C35.824219 13.625 35.914063 13.210938 35.78125 12.84375C34.78125 7.792969 30.332031 4 25 4 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
													<!-- locked -->
													<path
														class={endDateElmtIsON === false ? 'opacity-0' : 'opacity-100'}
														d="M25 4C18.9375 4 14 8.9375 14 15L14 20.84375C11.527344 23.519531 10 27.078125 10 31C10 39.269531 16.730469 46 25 46C33.269531 46 40 39.269531 40 31C40 27.078125 38.472656 23.519531 36 20.84375L36 15C36 8.9375 31.0625 4 25 4 Z M 25 6C29.984375 6 34 10.015625 34 15L34 19.03125C31.488281 17.136719 28.378906 16 25 16C21.621094 16 18.511719 17.136719 16 19.03125L16 15C16 10.015625 20.015625 6 25 6 Z M 25 28C26.65625 28 28 29.34375 28 31C28 32.304688 27.164063 33.398438 26 33.8125L26 36C26 36.550781 25.550781 37 25 37C24.449219 37 24 36.550781 24 36L24 33.8125C22.835938 33.398438 22 32.304688 22 31C22 29.34375 23.34375 28 25 28Z"
													/>
												</svg>
											</button>
										</div>
									</div>

									<!--! randomize dates -->
									<div
										class="w-[95%] rounded-md h-fit test:bg-gray-300/20 test:bg-gray-50/70 test:bg-white/50 test:bg-transparent [#0e0e0e]"
									>
										<!-- <form action="" class=" flex flex-col items-center space-y-2 h-fit py-4"> -->
										<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<label
											on:mousedown={(e) => {
												let btn = document.getElementById('randomizedates');

												btn.style.rotate = '360deg';
												btn.style.scale = '0.6';
												let intervalID = setInterval(() => {
													btn.style.rotate = '720deg';
													btn.style.scale = '1';
													return clearInterval(intervalID);
												}, 400);
											}}
											on:click={() => {
												executeRandomizeDateRange();
											}}
											for="randomizeDates"
											class="flex justify-between items-center px-4 hover:cursor-pointer w-full h-[45px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
										>
											<input
												type="button"
												on:click={() => {
													executeRandomizeDateRange();
												}}
												name=""
												id="randomizeDates"
												class="sr-only"
											/>

											<div class="flex flex-col space-y-1">
												<h2 class="text-xs font-semibold -mt-2 text-white/90">Randomize Dates</h2>

												<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
													<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
														In selected range</span
													>
												</h2>
											</div>

											<h2 class="font-semibold text-lg leading-3 relative">
												<span
													class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-2
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
												>
													<!-- In -->
													<svg
														id="randomizedates"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 50 50"
														width="20"
														height="20"
														class="fill-white {transition}"
													>
														<path
															d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
														/>
													</svg>
												</span>
											</h2>
										</label>
										<!-- <path
								slot="icon"
								d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
							/> -->

										<!-- {#key $showMoreDescription}
							{#if $showMoreDescription === true}
								<Input
									bind:inputValue={$transactions[$activeRecordID]?.more}
									{identifier}
									placeholder="Detail"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!- <path
								slot="icon"
								d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
							/> ->
								</Input>
							{/if}
						{/key} -->
										<!-- </form> -->
									</div>
								</form>
							{/if}
						</div>
					</div>
				</div>

				<!--! Scale -->
				<div
					class="flex bg-gradient-to-bl from-black/5 to-black/10 justify-between space-x-2 items-center w-[95%] rounded-md h-fit m-0 p-3"
				>
					<div class="flex flex-col space-y-4 items-center w-full h-fit m-0">
						<div class="flex flex-col space-y-0 text-slate-700/50">
							<h2 class="font-semibold text-l5">Template style</h2>
							<span class="font-normal text-xs opacity-80"
								>For better results, pick a header style that matches your data</span
							>
						</div>
						<div class="flex flex-wrap gap-2 w-full h-fit m-0 {transition} ">
							<button
								on:click={(e) => {
									$displayHeaderChoice = 1;
									removeBorders();
									applyConfiguration($displayHeaderChoice)
								}}
								type="button"
								class=" {$displayHeaderChoice === 1
									? 'bg-gradient-to-tr from-slate-600 to-slate-400'
									: 'bg-gradient-to-bl from-white/40 to-white/60'}   rounded-md flex items-center py-1 w-[47%] scale-100 {transition}"
							>
								<div
									class="{$displayHeaderChoice === 1
										? 'bg-white/50'
										: 'bg-gray-50/50'} {transition} rounded-sm w-6 h-6 m-2"
								/>

								<div class="flex flex-col justify-center w-[70px] h-10 space-y-1">
									<div
										class="{$displayHeaderChoice === 1
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[80%] h-[7px]"
									/>
									<div
										class="{$displayHeaderChoice === 1
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[60%] h-[5px]"
									/>
								</div>
							</button>
							<button
								on:click={(e) => {
									$displayHeaderChoice = 2;
									removeBorders();
									applyConfiguration($displayHeaderChoice)
								}}
								type="button"
								class="
								{$displayHeaderChoice === 2
									? 'bg-gradient-to-tr from-slate-600 to-slate-400'
									: 'bg-gradient-to-bl from-white/40 to-white/60'} 
								rounded-md flex items-center py-1 w-[47%] scale-100 {transition}"
							>
								<!-- <div class="bg-gray-50/50 rounded-sm w-6 h-6 m-2" /> -->

								<div class="flex flex-col justify-center w-[70px] h-10 space-y-1 ml-2">
									<div
										class="{$displayHeaderChoice === 2
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[80%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 2
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[70%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 2
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[60%] h-[5px]"
									/>
								</div>
							</button>
							<button
								on:click={(e) => {
									$displayHeaderChoice = 3;
									renderBorders()
									applyConfiguration($displayHeaderChoice)

									// removeBorders();
								}}
								type="button"
								class="
								{$displayHeaderChoice === 3
									? 'bg-gradient-to-tr from-slate-600 to-slate-400'
									: 'bg-gradient-to-bl from-white/40 to-white/60'} 
								rounded-md flex items-center py-1 w-[47%] scale-100 {transition}"
							>
								<!-- <div class="bg-gray-50/50 rounded-sm w-6 h-6 m-2" /> -->

								<div class="flex flex-col justify-center w-[70px] h-10 space-y-1 ml-2">
									<div
										class="{$displayHeaderChoice === 3
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[80%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 3
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[70%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 3
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[60%] h-[5px]"
									/>
								</div>
							</button>
							<button
								on:click={(e) => {
									$displayHeaderChoice = 4;
									removeBorders();
									applyConfiguration($displayHeaderChoice)
								}}
								type="button"
								class="
								{$displayHeaderChoice === 4
									? 'bg-gradient-to-tr from-slate-600 to-slate-400'
									: 'bg-gradient-to-bl from-white/40 to-white/60'} 
								rounded-md flex items-center py-1 w-[47%] scale-100 {transition}"
							>
								<!-- <div class="bg-gray-50/50 rounded-sm w-6 h-6 m-2" /> -->

								<div class="flex flex-col justify-center w-[70px] h-10 space-y-1 ml-2">
									<div
										class="{$displayHeaderChoice === 4
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[80%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 4
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[70%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 4
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[60%] h-[5px]"
									/>
								</div>
							</button>
							<button
								on:click={(e) => {
									$displayHeaderChoice = 5;
									removeBorders();
									applyConfiguration($displayHeaderChoice)

									// $statements[0].transactionHeaders.bookingDate.counter = 2
									// $statements[0].transactionHeaders.ref.counter = 0
									// $statements[0].transactionHeaders..counter = 0
									// applyConfiguration([],3,'logo',0) // headings, date format, logo, theme
									
								}}
								type="button"
								class="
								{$displayHeaderChoice === 5
									? 'bg-gradient-to-tr from-slate-600 to-slate-400'
									: 'bg-gradient-to-bl from-white/40 to-white/60'} 
								rounded-md flex items-center py-1 w-[47%] scale-100 {transition}"
							>
								<!-- <div class="bg-gray-50/50 rounded-sm w-6 h-6 m-2" /> -->

								<div class="flex flex-col justify-center w-[70px] h-10 space-y-1 ml-2">
									<div
										class="{$displayHeaderChoice === 5
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[80%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 5
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[70%] h-[5px]"
									/>
									<div
										class="{$displayHeaderChoice === 5
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[60%] h-[5px]"
									/>
								</div>
							</button>
							<button
								on:click={(e) => {
									$displayHeaderChoice = 6;
									renderBorders()
									applyConfiguration($displayHeaderChoice)
								}}
								type="button"
								class=" {$displayHeaderChoice === 6
									? 'bg-gradient-to-tr from-slate-600 to-slate-400'
									: 'bg-gradient-to-bl from-white/40 to-white/60'}   rounded-md flex items-center py-1 w-[47%] scale-100 {transition}"
							>
								<div
									class="{$displayHeaderChoice === 6
										? 'bg-white/50'
										: 'bg-gray-50/50'} {transition} rounded-sm w-6 h-6 m-2"
								/>

								<div class="flex flex-col justify-center w-[70px] h-10 space-y-1">
									<div
										class="{$displayHeaderChoice === 6
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[80%] h-[7px]"
									/>
									<div
										class="{$displayHeaderChoice === 6
											? 'bg-white/50'
											: 'bg-gray-50/50'} {transition} rounded-sm w-[60%] h-[5px]"
									/>
								</div>
							</button>
						</div>
						<div class="flex justify-between space-x-2 items-center w-full h-fit m-0">
							<!--! Add Logo Image -->
							<div
								class="shadow-sm w-full rounded-md h-fit test:bg-gray-300/20 test:bg-gray-50/70 bg-white/50 test:bg-transparent [#0e0e0e]"
							>
								<!-- ? <FilePond allowMultiple={true} max-files={3} server="/api" /> -->

								<form action="" class=" flex flex-col items-center space-y-2 h-fit px-4 py-4">
									<div class="w-full flex space-x-2">
										<div
											style="background-image: url({$logoUrl || ''});"
											class="w-[50px] h-[50px] flex justify-center items-center rounded-md bg-no-repeat bg-contain bg-center overflow-hidden border-solid border-[0.006em] border-slate-100/90"
										>
											{#if $logoUrl === ''}
												{#key $logoUrl}
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 48 48"
														class="w-[40px] h-[40px]"
													>
														<linearGradient
															id="imCJKIfzwKtpBeBobeWKRa"
															x1="18.766"
															x2="27.561"
															y1="1.896"
															y2="42.938"
															gradientUnits="userSpaceOnUse"
														>
															<stop offset="0" stop-color="#21ad64" />
															<stop offset="1" stop-color="#088242" />
														</linearGradient>
														<path
															fill="url(#imCJKIfzwKtpBeBobeWKRa)"
															d="M41,42H7c-1.103,0-2-0.897-2-2V12.64c0-0.776,0.455-1.488,1.159-1.815l16.027-7.41c1.151-0.535,2.474-0.535,3.627,0l16.026,7.41C42.545,11.151,43,11.863,43,12.64V40C43,41.103,42.103,42,41,42z"
														/>
														<path
															d="M21.724,18.649c0-0.887,0.766-1.337,2.276-1.337c2.08,0,3.8,0.661,4.641,1.055C29.162,18.612,31,18.954,31,16.885V14.79c0-1.534-0.926-2.06-1.324-2.215c-0.967-0.376-2.176-0.613-3.676-0.72V10.5C26,9.673,25.327,9,24.5,9h-1C22.673,9,22,9.673,22,10.5v1.473c-3.216,0.588-6.348,2.681-6.348,7.025c0,8.694,10.624,7.945,10.624,9.909c0,0.355,0,1.299-2.276,1.299c-2.644,0-4.965-1.082-5.613-1.413C17.876,28.53,16,28.34,16,30.262v2.383c0,0.856,0.512,1.626,1.305,1.963c1.341,0.57,3.071,1.024,4.695,1.243V37.5c0,0.827,0.673,1.5,1.5,1.5h1c0.827,0,1.5-0.673,1.5-1.5v-1.658c4.664-0.776,6.348-4.261,6.348-7.149C32.348,20.202,21.724,21.55,21.724,18.649z"
															opacity=".05"
														/>
														<path
															d="M21.224,18.649c0-1.553,1.631-1.837,2.776-1.837c1.977,0,3.743,0.582,4.853,1.103c0.478,0.224,1.647,0.244,1.647-1.03V14.79c0-1.118-0.595-1.59-1.005-1.749c-0.957-0.372-2.241-0.625-3.995-0.711V10.5c0-0.552-0.448-1-1-1h-1c-0.552,0-1,0.448-1,1v1.907c-3.166,0.446-6.348,2.372-6.348,6.59c0,8.077,10.624,6.963,10.624,9.909c0,0.795-0.394,1.799-2.776,1.799c-2.572,0-4.881-0.977-5.84-1.468c-0.469-0.241-1.66-0.177-1.66,1.024v2.384c0,0.657,0.394,1.245,1.001,1.503c1.424,0.605,3.299,1.074,4.999,1.254V37.5c0,0.552,0.448,1,1,1h1c0.552,0,1-0.448,1-1v-2.1c4.663-0.583,6.348-3.886,6.348-6.708C31.848,20.849,21.224,22.225,21.224,18.649z"
															opacity=".07"
														/>
														<path
															fill="#fff"
															d="M31.348,28.692c0-7.196-10.624-5.791-10.624-10.043c0-2.22,2.495-2.337,3.276-2.337c1.875,0,3.685,0.503,5.065,1.15C29.5,17.667,30,17.365,30,16.885V14.79c0-0.702-0.264-1.119-0.686-1.283c-0.946-0.368-2.305-0.636-4.314-0.703V10.5c0-0.276-0.224-0.5-0.5-0.5h-1c-0.276,0-0.5,0.224-0.5,0.5v2.342c-3.116,0.305-6.348,2.063-6.348,6.156c0,7.46,10.624,5.981,10.624,9.909c0,1.235-0.789,2.299-3.276,2.299c-2.5,0-4.797-0.872-6.068-1.523C17.504,29.464,17,29.781,17,30.261v2.384c0,0.457,0.275,0.864,0.696,1.042c1.506,0.64,3.527,1.124,5.304,1.266V37.5c0,0.276,0.224,0.5,0.5,0.5h1c0.276,0,0.5-0.224,0.5-0.5v-2.541C29.663,34.569,31.348,31.448,31.348,28.692z"
														/>
													</svg>
												{/key}
											{/if}
										</div>
										<div class="w-fit flex flex-col justify-center">
											<label
												for="logoFileInput"
												class="flex items-center px-1 hover:cursor-pointer w-fit overflow-hidden

		
	
								rounded-md {transition}
								"
											>
												<!-- 'bg-gradient-to-tr from-gray-100 to-gray-50 text-slate-400 border-slate-200/50' -->
												<input
													type="file"
													bind:files={$logoUrl}
													id="logoFileInput"
													on:change={(e) => {
														let mediaUrl = URL.createObjectURL(e.target.files[0]);
														$logoUrl = mediaUrl;
														// document.querySelector('#my-vid')?.setAttribute('src', mediaUrl);
														//console.log(mediaUrl);

														// console.log($logoUrl);
													}}
													class="sr-only"
												/>

												<h2 class=" font-semibold text-xs text-slate-700/70">Bank Logo</h2>
											</label>

											<div class="flex items-center space-x-2">
												<button
													type="button"
													class="p-1 opacity-90 hover:opacity-100 text-slate-700/50 text-left flex space-x-4"
												>
													<!-- <h2 class="text-xs">Edit</h2> -->
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 48 48"
														width="15"
														height="15"
														class="fill-current"
													>
														<path
															d="M11.5 6C8.468 6 6 8.468 6 11.5L6 36.5C6 37.505 6.2750469 38.445813 6.7480469 39.257812L21.1875 25.134766C22.7635 23.607766 25.236453 23.606719 26.814453 25.136719L33.322266 31.505859L38.927734 25.900391C39.785734 25.042391 40.845047 24.4615 41.998047 24.1875L41.998047 11.5C41.999047 8.468 39.532 6 36.5 6L11.5 6 z M 30.5 14C32.433 14 34 15.567 34 17.5C34 19.433 32.433 21 30.5 21C28.567 21 27 19.433 27 17.5C27 15.567 28.567 14 30.5 14 z M 43.513672 26.001953C42.364922 26.002203 41.21725 26.439 40.34375 27.3125L28.326172 39.328125C28.015172 39.638125 27.789922 40.025266 27.669922 40.447266L26.058594 46.087891C25.909594 46.610891 26.053453 47.175547 26.439453 47.560547C26.724453 47.845547 27.107 48 27.5 48C27.638 48 27.776109 47.980406 27.912109 47.941406L33.554688 46.330078C33.978687 46.209078 34.365922 45.980828 34.669922 45.673828L46.685547 33.658203C47.532547 32.811203 48 31.683375 48 30.484375C48 29.285375 47.532547 28.1595 46.685547 27.3125C45.811047 26.438 44.662422 26.001703 43.513672 26.001953 z M 24 26.994141C23.73825 26.994016 23.476437 27.093516 23.273438 27.291016L8.9082031 41.347656C9.6802031 41.762656 10.563 42 11.5 42L25.144531 42L25.744141 39.900391C25.958141 39.150391 26.362109 38.462062 26.912109 37.914062L31.199219 33.628906L24.726562 27.292969C24.522562 27.094969 24.26175 26.994266 24 26.994141 z"
														/>
													</svg>
												</button>
												<button
													type="button"
													on:click={() => {
														$logoUrl = '';
														// $isShowingLogoImage
													}}
													class="p-1 opacity-90 hover:opacity-100 text-slate-700/50 text-left flex space-x-4"
												>
													<!-- <h2 class="text-xs">Reset</h2> -->
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 48 48"
														width="15"
														height="15"
														class="fill-current"
													>
														<path
															d="M37.476562 5.9785156 A 1.50015 1.50015 0 0 0 36 7.5L36 10.605469C32.815876 7.7471496 28.609324 6 24 6C14.0764 6 6 14.0764 6 24C6 33.9236 14.0764 42 24 42C33.9236 42 42 33.9236 42 24C42 23.048235 41.90482 22.141037 41.773438 21.275391 A 1.50015 1.50015 0 1 0 38.808594 21.724609C38.925211 22.492963 39 23.247765 39 24C39 32.3024 32.3024 39 24 39C15.6976 39 9 32.3024 9 24C9 15.6976 15.6976 9 24 9C27.934257 9 31.480462 10.527501 34.150391 13L30.5 13 A 1.50015 1.50015 0 1 0 30.5 16L37.5 16 A 1.50015 1.50015 0 0 0 39 14.5L39 7.5 A 1.50015 1.50015 0 0 0 37.476562 5.9785156 z"
														/>
													</svg>
												</button>
												<button
													type="button"
													on:click={() => {
														$isShowingLogoImage = !$isShowingLogoImage;
													}}
													class="p-1 opacity-90 hover:opacity-100 text-slate-700/50 text-left flex space-x-4"
												>
													<!-- <h2 class="text-xs">Hide</h2> -->
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 48 48"
														width="15"
														height="15"
														class="fill-current"
													>
														<path
															d="M42.470703 3.9863281 A 1.50015 1.50015 0 0 0 41.439453 4.4394531L28.025391 17.853516C28.02058 17.85139 28.016533 17.847821 28.011719 17.845703L25.652344 20.205078C25.657802 20.206406 25.662515 20.209597 25.667969 20.210938L17.210938 28.667969C17.209447 28.661908 17.206553 28.656457 17.205078 28.650391L14.845703 31.009766C14.848052 31.015107 14.851157 31.020054 14.853516 31.025391L4.4394531 41.439453 A 1.50015 1.50015 0 1 0 6.5605469 43.560547L16.513672 33.607422C18.345732 35.683816 21.01901 37 24 37C29.514 37 34 32.514 34 27C34 24.019566 32.683637 21.345974 30.607422 19.513672L35.052734 15.068359C39.90447 17.90912 43.668811 22.496845 45.050781 27.869141C45.220781 28.549141 45.83 29 46.5 29C46.62 29 46.749141 28.989219 46.869141 28.949219C47.679141 28.749219 48.159219 27.930859 47.949219 27.130859C46.409379 21.128251 42.461227 16.073087 37.277344 12.84375L43.560547 6.5605469 A 1.50015 1.50015 0 0 0 42.470703 3.9863281 z M 23.990234 9C12.820234 9 2.7507813 16.620859 0.05078125 27.130859C-0.15921875 27.930859 0.32085937 28.749219 1.1308594 28.949219C1.9308594 29.159219 2.7492187 28.679141 2.9492188 27.869141C5.2792187 18.819141 14.330234 12 23.990234 12C25.700234 12 27.389531 12.209141 29.019531 12.619141L31.480469 10.160156C29.090469 9.4001562 26.570234 9 23.990234 9 z M 24 17C18.486 17 14 21.486 14 27C14 27.197 14.017297 27.390938 14.029297 27.585938L17.751953 23.863281C18.428953 22.521281 19.521281 21.428953 20.863281 20.751953L24.583984 17.029297C24.389984 17.017297 24.197 17 24 17 z M 28.472656 21.648438C30.00901 22.931321 31 24.845705 31 27C31 30.859 27.86 34 24 34C21.845705 34 19.931321 33.009291 18.648438 31.472656L21.488281 28.632812 A 3 3 0 0 0 24 30 A 3 3 0 0 0 25.632812 24.488281L28.472656 21.648438 z"
														/>
													</svg>
												</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

				<!--! Editting Contents Removed here -->

				<!--! Control Document Environments -->

				<div
					class="shadow-sm w-[95%] rounded-sm h-fit test:bg-gray-300/20 test:bg-gray-50/70 bg-white/50 test:bg-transparent [#0e0e0e]"
				>
					<!-- ? <FilePond allowMultiple={true} max-files={3} server="/api" /> -->

					<form action="" class=" flex flex-col items-center space-y-2 h-fit py-4">
						<!-- <input
							type="range"
							on:change={(e) => {
								// console.log(e);
							}}
							bind:value={$zoomLevel}
							min="0"
							max="1"
							step="0.1"
							name=""
							id=""
							width="1px"
							class="w"
						/> -->

						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:click={(e) => {
								// console.log(e);

								$statements[0].configurations.columnHeaders.renderDateColumn =
									!$statements[0].configurations.columnHeaders.renderDateColumn;
							}}
							for="showDateBase"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-sky-600 to-sky-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-sm hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);

									$statements[0].configurations.columnHeaders.renderDateColumn =
										!$statements[0].configurations.columnHeaders.renderDateColumn;
								}}
								name=""
								id="showDateBase"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">Date Column</h2>
								<h2 class="font-light text-[10px] text-white/90 w-[30ch] relative">
									<span
										class="absolute top-1/2 left-0 -translate-y-1/2 {$statements[0].configurations
											.columnHeaders.renderDateColumn === true
											? 'opacity-100'
											: 'opacity-0'} {transition}"
									>
										Currently showing</span
									>
									<span
										class="absolute top-1/2 left-0 -translate-y-1/2 {$statements[0].configurations
											.columnHeaders.renderDateColumn === false
											? 'opacity-100'
											: 'opacity-0'} {transition}"
										>Toggle state
									</span>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {$statements[0].configurations.columnHeaders
										.renderDateColumn === true
										? 'opacity-100 scale-100'
										: 'opacity-0 scale-0'} {transition}"
								>
									<!-- In -->
									Yes
								</span>
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {$statements[0].configurations.columnHeaders
										.renderDateColumn === false
										? 'opacity-100 scale-100'
										: 'opacity-0 scale-0'} {transition}"
									>OFF
								</span>
							</h2>
						</label>

						<ShowColumnWithColorToggleCheck
							labelFor="showDateWithColorToggle"
							columnName="Date Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderDateColumn}
							{transition}
						/>
						<ShowColumnWithColorToggleCheck
							labelFor="showBookingDateWithColorToggle"
							columnName="Booking Date Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderBookingDateColumn}
							{transition}
						/>
						<ShowColumnWithColorToggleCheck
							labelFor="showValueDateWithColorToggle"
							columnName="Value Date Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderValueDateColumn}
							{transition}
						/>
						<ShowColumnWithColorToggleCheck
							labelFor="showDescriptionWithColorToggle"
							columnName="Description Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderDescriptionColumn}
							{transition}
						/>
						<ShowColumnWithColorToggleCheck
							labelFor="showRefWithColorToggle"
							columnName="Ref Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderRefColumn}
							{transition}
						/>
						<ShowColumnWithColorToggleCheck
							labelFor="showInWithColorToggle"
							columnName="{$statements[0].transactionHeaders.in.terms[
								$statements[0].transactionHeaders.in.counter
							]} Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderInColumn}
							{transition}
						/>
						<ShowColumnWithColorToggleCheck
							labelFor="showOutWithColorToggle"
							columnName="Debits Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderOutColumn}
							{transition}
						/>
						<ShowColumnWithColorToggleCheck
							labelFor="showBalanceWithColorToggle"
							columnName="Balance Column"
							bind:toggleState={$statements[0].configurations.columnHeaders.renderBalanceColumn}
							{transition}
						/>

						<!-- {#key $showMoreDescription}
							{#if $showMoreDescription === true}
								<Input
									bind:inputValue={$transactions[$activeRecordID]?.more}
									{identifier}
									placeholder="Detail"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!- <path
								slot="icon"
								d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
							/> ->
								</Input>
							{/if}
						{/key} -->
					</form>
				</div>

				<!--! Document Column -->
				<div
					class="shadow-sm w-[95%] rounded-sm h-fit test:bg-gray-300/20 test:bg-gray-50/70 bg-white/50 test:bg-transparent [#0e0e0e]"
				>
					<!-- ? <FilePond allowMultiple={true} max-files={3} server="/api" /> -->

					<form action="" class=" flex flex-col items-center space-y-2 h-fit py-4">
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumndate');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.date.counter >=
									$statements[0].transactionHeaders.date.terms.length - 1
								) {
									$statements[0].transactionHeaders.date.counter = -1;
								} else if ($statements[0].transactionHeaders.date.counter < 0) {
									$statements[0].transactionHeaders.date.counter =
										$statements[0].transactionHeaders.date.terms.length - 1;
								}
								$statements[0].transactionHeaders.date.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.date.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.date.terms[
												$statements[0].transactionHeaders.date.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumndate"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumnbookindate');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.bookingDate.counter >=
									$statements[0].transactionHeaders.bookingDate.terms.length - 1
								) {
									$statements[0].transactionHeaders.bookingDate.counter = -1;
								} else if ($statements[0].transactionHeaders.bookingDate.counter < 0) {
									$statements[0].transactionHeaders.bookingDate.counter =
										$statements[0].transactionHeaders.bookingDate.terms.length - 1;
								}
								$statements[0].transactionHeaders.bookingDate.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.bookingDate.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.bookingDate.terms[
												$statements[0].transactionHeaders.bookingDate.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumnbookindate"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumnvaluedate');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.valueDate.counter >=
									$statements[0].transactionHeaders.valueDate.terms.length - 1
								) {
									$statements[0].transactionHeaders.valueDate.counter = -1;
								} else if ($statements[0].transactionHeaders.valueDate.counter < 0) {
									$statements[0].transactionHeaders.valueDate.counter =
										$statements[0].transactionHeaders.valueDate.terms.length - 1;
								}
								$statements[0].transactionHeaders.valueDate.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.valueDate.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.valueDate.terms[
												$statements[0].transactionHeaders.valueDate.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumnvaluedate"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumn1');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.in.counter >=
									$statements[0].transactionHeaders.in.terms.length - 1
								) {
									$statements[0].transactionHeaders.in.counter = -1;
								} else if ($statements[0].transactionHeaders.in.counter < 0) {
									$statements[0].transactionHeaders.in.counter =
										$statements[0].transactionHeaders.in.terms.length - 1;
								}
								$statements[0].transactionHeaders.in.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.in.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.in.terms[
												$statements[0].transactionHeaders.in.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumn1"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>

						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumn2');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.out.counter >=
									$statements[0].transactionHeaders.out.terms.length - 1
								) {
									$statements[0].transactionHeaders.out.counter = -1;
								} else if ($statements[0].transactionHeaders.out.counter < 0) {
									$statements[0].transactionHeaders.out.counter =
										$statements[0].transactionHeaders.out.terms.length - 1;
								}
								$statements[0].transactionHeaders.out.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.out.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.out.terms[
												$statements[0].transactionHeaders.out.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumn2"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumn5');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.ref.counter >=
									$statements[0].transactionHeaders.ref.terms.length - 1
								) {
									$statements[0].transactionHeaders.ref.counter = -1;
								} else if ($statements[0].transactionHeaders.ref.counter < 0) {
									$statements[0].transactionHeaders.ref.counter =
										$statements[0].transactionHeaders.ref.terms.length - 1;
								}
								$statements[0].transactionHeaders.ref.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.ref.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.ref.terms[
												$statements[0].transactionHeaders.ref.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumn5"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumn6');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.description.counter >=
									$statements[0].transactionHeaders.description.terms.length - 1
								) {
									$statements[0].transactionHeaders.description.counter = -1;
								} else if ($statements[0].transactionHeaders.description.counter < 0) {
									$statements[0].transactionHeaders.description.counter =
										$statements[0].transactionHeaders.description.terms.length - 1;
								}
								$statements[0].transactionHeaders.description.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.description.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.description.terms[
												$statements[0].transactionHeaders.description.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumn6"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<label
							on:mousedown={(e) => {
								let btn = document.getElementById('refreshcolumn4');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								if (
									$statements[0].transactionHeaders.balance.counter >=
									$statements[0].transactionHeaders.balance.terms.length - 1
								) {
									$statements[0].transactionHeaders.balance.counter = -1;
								} else if ($statements[0].transactionHeaders.balance.counter < 0) {
									$statements[0].transactionHeaders.balance.counter =
										$statements[0].transactionHeaders.balance.terms.length - 1;
								}
								$statements[0].transactionHeaders.balance.counter++;
							}}
							for="shuffleInsLabel"
							class="flex justify-between items-center px-4 hover:cursor-pointer w-[80%] h-[38px]

								bg-gradient-to-tr from-slate-600 to-slate-400 text-white test:bg-gradient-to-tr_from-gray-400_to-gray-200_text-slate-700
                            rounded-md border-[0.005em] border-solid border-white/60 hover:shadow-lg {transition}
                            "
						>
							<input
								type="button"
								on:click={(e) => {
									// console.log(e);
								}}
								name=""
								id="shuffleInsLabel"
								class="sr-only"
							/>

							<div class="flex flex-col space-y-1">
								<h2 class="text-xs font-semibold -mt-2 text-white/90">
									{#key $statements[0].transactionHeaders.balance.counter}
										<span
											in:scale={{ delay: 200, duration: 500, easing: cubicInOut }}
											out:fade={{ delay: 0, duration: 250, easing: cubicInOut }}
										>
											{$statements[0].transactionHeaders.balance.terms[
												$statements[0].transactionHeaders.balance.counter
											]}
										</span>
									{/key}
								</h2>

								<h2 class="font-light text-[10px] text-white/50 w-[30ch] relative">
									<span class="absolute top-1/2 left-0 -translate-y-1/2 {transition}">
										Click to change</span
									>
								</h2>
							</div>

							<h2 class="font-semibold text-lg leading-3 relative">
								<span
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-4 py-4 rounded-sm bg-gradient-to-tr from-white/20 to-white/5 text-white/90
                                    {transition}"
								>
									<!-- In -->
									<svg
										id="refreshcolumn4"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 50 50"
										width="20"
										height="20"
										class="fill-white {transition}"
									>
										<path
											d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
										/>
									</svg>
								</span>
							</h2>
						</label>
						<!-- <path
								slot="icon"
								d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
							/> -->

						<!-- {#key $showMoreDescription}
							{#if $showMoreDescription === true}
								<Input
									bind:inputValue={$transactions[$activeRecordID]?.more}
									{identifier}
									placeholder="Detail"
									guidePlaceholder="Type now..."
									message="You messed up"
								>
									<!- <path
								slot="icon"
								d="M23.958984 2 A 1.50015 1.50015 0 0 0 23.455078 2.1035156L2.9550781 10.103516 A 1.50015 1.50015 0 1 0 4.0449219 12.896484L24 5.109375L43.955078 12.896484 A 1.50015 1.50015 0 1 0 45.044922 10.103516L24.544922 2.1035156 A 1.50015 1.50015 0 0 0 23.958984 2 z M 9 15C7.343 15 6 16.343 6 18L6 39C6 40.657 7.343 42 9 42L20.554688 42C21.247688 43.191 22.523 44 24 44C25.477 44 26.752312 43.191 27.445312 42L39 42C40.657 42 42 40.657 42 39L42 18C42 16.343 40.657 15 39 15L30 15C27.515 15 25.5 17.015 25.5 19.5L25.5 38.5C25.5 39.328 24.828 40 24 40C23.172 40 22.5 39.328 22.5 38.5L22.5 19.5C22.5 17.015 20.485 15 18 15L9 15 z"
							/> ->
								</Input>
							{/if}
						{/key} -->
					</form>
				</div>

				<div
					class=" p-3 test_shadow-sm flex justify-start items-center flex-wrap w-[95%] h-fit test:bg-gray-300/20 bg-white/40 [#0e0e0e]"
				>
					{#each $documentThemes as _, index}
						<button
							on:click={() => {
								$activeTheme = index;
							}}
							type="button"
							class=" m-1 border-none text-white/80 rounded-full w-5 h-5 {$documentThemes[index]
								.primaryBg}
                                {$activeTheme === index
								? `z-30 py-1 shadow-xl scale-100 !ring-1 ring-solid ${$documentThemes[$activeTheme].ring} ring-offset-4 ring-offset-white`
								: `z-10 py-0 shadow-sm scale-90 !ring-0`}
                                    focus:py-1 focus:outline-none focus:shadow-xl !focus:ring-4 focus:ring-solid {$documentThemes[
								$activeTheme
							]
								.ringFocus} focus:ring-offset-4 focus:ring-offset-white flex justify-center items-center transition-all duration-300 ease-out
                                "
						>
							<!-- tick icon if active theme -->

							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 50 50"
								class="w-3 h-3 fill-white {$activeTheme === index
									? 'scale-100 opacity-100'
									: 'scale-0 opacity-0'} {transition}"
							>
								<path
									d="M25 2C12.317 2 2 12.317 2 25C2 37.683 12.317 48 25 48C37.683 48 48 37.683 48 25C48 20.44 46.660281 16.189328 44.363281 12.611328L42.994141 14.228516C44.889141 17.382516 46 21.06 46 25C46 36.579 36.579 46 25 46C13.421 46 4 36.579 4 25C4 13.421 13.421 4 25 4C30.443 4 35.393906 6.0997656 39.128906 9.5097656L40.4375 7.9648438C36.3525 4.2598437 30.935 2 25 2 z M 43.236328 7.7539062L23.914062 30.554688L15.78125 22.96875L14.417969 24.431641L24.083984 33.447266L44.763672 9.046875L43.236328 7.7539062 z"
								/>
							</svg>
						</button>
					{/each}
				</div>
				<div
					class="test_shadow-sm w-[95%] h-[30%] test:bg-gray-300/20 bg-white/40 test:bg-transparent [#0e0e0e]"
				>
					&nbsp;
				</div>
				<div
					class="test_shadow-sm w-[95%] h-[30%] test:bg-gray-300/20 bg-white/40 test:bg-transparent [#0e0e0e]"
				>
					&nbsp;
				</div>
			</div>

			<!-- ? switch tabs <div class="div"></div> -->
		</div>
	</section>
	<!-- {:catch error}
		<span class="text-red-600 font-bold text-2xl">{error}</span>
	{/await} -->
</main>

<style>

	 
	#viewport::-webkit-scrollbar-thumb {
		border: 5px solid rgba(0, 0, 0, 0);
		background-clip: padding-box;
		border-radius: 6px;
		/* background-color: #AAAAAA; */
	}
	
	/* .statementTabisOn {
		transform: translateX(0);
		transition: all 0.4s cubic-bezier(0.65, 0.05, 0.36, 1);
	}
	.transactionTabisOn {
		transform: translateX(-245px);
		transition: all 0.4s cubic-bezier(0.65, 0.05, 0.36, 1);
	}
	.componentsTabisOn {
		transform: translateX(-490px);
		transition: all 0.4s cubic-bezier(0.65, 0.05, 0.36, 1);
	} */

	/*Loader spiner 4 rings*/
	.loader {
		width: 48px;
		height: 48px;
		border: 3px dotted #fff;
		border-style: solid solid dotted dotted;
		border-radius: 50%;
		display: inline-block;
		position: relative;
		box-sizing: border-box;
		animation: rotation 2s linear infinite;
	}
	.loader::after {
		content: '';
		box-sizing: border-box;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		border: 3px dotted #ff3d00;
		border-style: solid solid dotted;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		animation: rotationBack 1s linear infinite;
		transform-origin: center center;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes rotationBack {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(-360deg);
		}
	}
	/*<span class="loader"></span>*/

	/*Loader spiner*/
	@keyframes printerPaper {
		0%,
		25% {
			height: 50px;
		}
		75%,
		100% {
			height: 0;
		}
	}

	@keyframes PrintedPaper {
		0%,
		30% {
			height: 0px;
			top: calc(100% - 8px);
		}

		80% {
			height: 80px;
			top: calc(100% - 8px);
			opacity: 1;
		}
		100% {
			height: 80px;
			top: calc(100% + 10px);
			opacity: 0;
		}
	}

	.loader {
		position: relative;
		width: 120px;
		height: 55px;
		background-repeat: no-repeat;
		background-image: radial-gradient(circle 2.5px, #ff3d00 100%, transparent 0),
			linear-gradient(#525252 90px, transparent 0), linear-gradient(#ececec 120px, transparent 0),
			linear-gradient(to right, #eee 10%, #333 10%, #333 90%, #eee 90%);

		background-size: 5px 5px, 90px 10px, 120px 45px, 100px 15px;
		background-position: 110px 15px, center bottom, center bottom, center 0;
	}
	.loader:before {
		content: '';
		width: 70px;
		background-color: #fff;
		box-shadow: 0 0 10px #0003;
		position: absolute;
		left: 50%;
		transform: translatex(-50%);
		bottom: calc(100% - 10px);
		animation: printerPaper 4s ease-in infinite;
	}
	.loader:after {
		content: '';
		width: 70px;
		height: 80px;
		background-color: #fff;
		background-image: linear-gradient(to bottom, #fff 50%, #ff3d00 51%),
			linear-gradient(to bottom, #bbb 50%, #0000 51%);
		background-size: 60px 20px, 60px 10px;
		background-repeat: no-repeat, repeat-y;
		background-position: center 55px, center 0;
		position: absolute;
		left: 50%;
		transform: translatex(-50%) rotate(180deg);
		box-shadow: 0 10px #fff inset;
		top: calc(100% - 8px);
		animation: PrintedPaper 4s ease-in infinite;
	}

	/*<span class="loader"></span>*/

	/*Loader spiner 2*/
	@keyframes lds-hourglass {
		0% {
			transform: rotate(0);
			animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
		}
		50% {
			transform: rotate(900deg);
			animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
		}
		100% {
			transform: rotate(1800deg);
		}
	}

	.lds-hourglass {
		display: inline-block;
		position: relative;
		width: 80px;
		height: 80px;
	}
	.lds-hourglass:after {
		content: ' ';
		display: block;
		border-radius: 50%;
		width: 0;
		height: 0;
		margin: 8px;
		box-sizing: border-box;
		border: 32px solid #fdd;
		border-color: #fdd transparent #fdd transparent;
		animation: lds-hourglass 1.2s infinite;
	}
	/*<div class="lds-hourglass"></div>*/
</style>
