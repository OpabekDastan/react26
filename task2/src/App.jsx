import './App.css'
import Profile from './components/Profile'
import AboutMe from './components/AboutMe'
import Contacts from './components/Contacts'

function App() {
  return (
    <div className="page">
      <Profile name="Dastan" image="/cover.jpg" />
      <AboutMe />
      <Contacts />
    </div>
  )
}

export default App