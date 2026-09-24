function Profile({ name, image }) {
  return (
    <section className="profile">
      <img className="profile-photo" src={image} alt={name} />
      <h1>{name}</h1>
      <p className="tagline">LinkinPark Enjoyer</p>
    </section>
  );
}

export default Profile;
