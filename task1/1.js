// console.log("Hello from JS");

// const time = 1200;
// console.log(`Loaded in ${time} ms`);

// //task1

// const task =  {
//     name: "Load users",
//     status:  "idle",
//     count: 0
// }

// console.log(`${task.name}: ${task.status}, runs:${task.count}, time: ${randomTime()}`)




function randomTime(){
     let max = 2000;
     let min = 500;

     let result = Math.floor(Math.random()*(max-min)+min);

     return result
}
function createTask(name) {
	let count = 0;
	let status = "idle";
	
	return {
		run: () => {
			status = "loading";
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					if (Math.random() < 0.3){
						status = "Failed!"
						count++;
						reject(new Error(status));
					} 
					else {
						status = "Success"
						count++;
						resolve(status);
						
					}
				}, randomTime());
			})
			
			
		},
		getCount: () => count,

		reset: () => {
			count = 0;
			status = "idle";
			console.log(`${name} reset`);
		},
	};
}



async function runSequential() {
	const task1 = createTask("Load Users");
	const task2 = createTask("Load Posts");
	const task3 = createTask("Load Comments");
	

	const start = Date.now();
	try{
		const r1 = await task1.run();
		console.log(r1);

	}
	catch (e) {
		console.log(e.message);
	}
	try{
		const r2 = await task2.run();
		console.log(r2);

	}
	catch (e) {
		console.log(e.message);
	}
	try{
		const r3 = await task3.run();
		console.log(r3);

	}
	catch (e) {
		console.log(e.message);
	}

	const end = Date.now();


	console.log(`All seq task finish in  ${end-start} ms`)


}

runSequential();

async function runConcurrent() {
	const task1 = createTask("Load Users");
	const task2 = createTask("Load Posts");
	const task3 = createTask("Load Comments");


	const start = Date.now()
	const results = await Promise.allSettled([
		task1.run(),
		task2.run(),
		task3.run(),
	]);
	const end = Date.now();
	console.log(results);
	console.log(`Took ${end - start}ms`);
}

runConcurrent();




