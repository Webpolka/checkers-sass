
// -------------------- JS CLASS ------------------------
// 
// ---- ХоверИнтент от Weblegko вешает класс 'active', и сбрасывает таймер задержки меню , при переходе на другой пункт

export class HoverIntentToggleClass {
	constructor(parentNode, childNode, pauseOver, pauseOut, callBackOver, callBackOverArg, callBackLeave, callBackLeaveArg) {
		this.timerOver;
		this.timerOut;
		this.elements = document.querySelector(parentNode).querySelectorAll(childNode);
		this.pauseOver = pauseOver;
		this.pauseOut = pauseOut;
		this.prevElement;
		this.callBackOverArg = callBackOverArg;
		this.callBackLeaveArg = callBackLeaveArg;
		this.callBackOver = callBackOver;
		this.callBackLeave = callBackLeave;
	}
	overLeave() {
		let pauseOver = this.pauseOver;
		let pauseOut = this.pauseOut;
		let prevElement = this.prevElement;
		let callBackOn = this.callBackOver; 
		let callBackOut = this.callBackLeave; 
		let overArg = this.callBackOverArg;
		let leaveArg = this.callBackLeaveArg;

		this.elements.forEach(function (element) {

			// --------------- Когда курсор над пунктом ----------
			element.addEventListener('mouseenter', function (event) {
				event.stopPropagation()			
				clearTimeout(this.timerOut)
				if (element && element !== prevElement && prevElement !== undefined) prevElement.classList.remove('active')
				this.timerOver = setTimeout(function () {
					if (!element.classList.contains('active')) element.classList.add('active');	
					if(callBackOn)callBackOn(overArg);			
				}, pauseOver);
			});

			// --------------- Когда курсор вне пункта ----------
			element.addEventListener('mouseleave', function (event) {
				event.stopPropagation()
				clearTimeout(this.timerOver)
				this.timerOut = setTimeout(function () {
					if (element.classList.contains('active')) element.classList.remove('active');	
					if(callBackOut)callBackOut(leaveArg);					
				}, pauseOut);
				if (element) prevElement = element
			});
		});
	}
	init() {
		this.overLeave();
	}
}
