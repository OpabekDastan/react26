const contactLinks = [
  { label: "GitHub", url: "https://github.com/OpabekDastan" },
  { label: "Instagram", url: "https://www.instagram.com/biiite_the_dast/" },
  { label: "Address", value: " Cybertron" },
];

function Contacts() {
  return (
    <section className="contacts">
      <h2>Contacts</h2>
      <ul>
        {contactLinks.map((link) => (
          <li key={link.label}>
            {link.url ? (
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ) : (
              <span>{link.label}: {link.value}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Contacts;