const text = `I dont know what write here, and then i decide about my fav music group
Outside of code, I'm a big Linkin Park fan - Meteora is one of my
        all time favorite albums, and "What I've Done" is on repeat more
        often than it probably should be.                           `
        `I am Optimus Prime, and I send this message to any surviving Autobots taking refuge among the stars: We are here. We are waiting.`;

function AboutMe() {
	return (
		<section className="about">
			<h2>About Me</h2>
			<p className="about-text">{text}</p>
		</section>
	);
}

export default AboutMe;
