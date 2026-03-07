import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import { Home } from "./components/Home.tsx";
import { MusicCollections } from "./components/MusicCollections.tsx";
import {
  AddMusicCollectionForm,
  EditMusicCollectionForm,
} from "./components/MusicCollectionForm.tsx";
import { MusicArtists } from "./components/MusicArtists.tsx";
import {
  AddMusicArtistForm,
  EditMusicArtistForm,
} from "./components/MusicArtistForm.tsx";
import { MusicTags } from "./components/MusicTags.tsx";
import {
  AddMusicTagForm,
  EditMusicTagForm,
} from "./components/MusicTagForm.tsx";
import { MusicContexts } from "./components/MusicContexts.tsx";
import {
  AddMusicContextForm,
  EditMusicContextForm,
} from "./components/MusicContextForm.tsx";
import { MusicCollectionKinds } from "./components/MusicCollectionKinds.tsx";
import {
  AddMusicCollectionKindForm,
  EditMusicCollectionKindForm,
} from "./components/MusicCollectionKindForm.tsx";
import { MusicLinks } from "./components/MusicLinks.tsx";
import {
  AddMusicLinkForm,
  EditMusicLinkForm,
} from "./components/MusicLinkForm.tsx";
import { MusicPlatforms } from "./components/MusicPlatforms.tsx";
import {
  AddMusicPlatformForm,
  EditMusicPlatformForm,
} from "./components/MusicPlatformForm.tsx";
import { MusicTracks } from "./components/MusicTracks.tsx";
import {
  AddMusicTrackForm,
  EditMusicTrackForm,
} from "./components/MusicTrackForm.tsx";

// --- Main App with Router ---
function App() {
  return (
    <LocationProvider>
      <div>
        <main>
          <Router>
            <Route path="/" component={Home} />

            <Route path="/musicCollections" component={MusicCollections} />
            <Route
              path="/musicCollections/add"
              component={AddMusicCollectionForm}
            />
            <Route
              path="/musicCollections/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicCollectionForm id={id} />
              )}
            />

            <Route path="/musicArtists" component={MusicArtists} />
            <Route path="/musicArtists/add" component={AddMusicArtistForm} />
            <Route
              path="/musicArtists/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicArtistForm id={id} />
              )}
            />

            <Route path="/musicTags" component={MusicTags} />
            <Route path="/musicTags/add" component={AddMusicTagForm} />
            <Route
              path="/musicTags/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicTagForm id={id} />
              )}
            />

            <Route path="/musicContexts" component={MusicContexts} />
            <Route path="/musicContexts/add" component={AddMusicContextForm} />
            <Route
              path="/musicContexts/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicContextForm id={id} />
              )}
            />

            <Route
              path="/musicCollectionKinds"
              component={MusicCollectionKinds}
            />
            <Route
              path="/musicCollectionKinds/add"
              component={AddMusicCollectionKindForm}
            />
            <Route
              path="/musicCollectionKinds/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicCollectionKindForm id={id} />
              )}
            />

            <Route path="/musicLinks" component={MusicLinks} />
            <Route path="/musicLinks/add" component={AddMusicLinkForm} />
            <Route
              path="/musicLinks/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicLinkForm id={id} />
              )}
            />

            <Route path="/musicPlatforms" component={MusicPlatforms} />
            <Route
              path="/musicPlatforms/add"
              component={AddMusicPlatformForm}
            />
            <Route
              path="/musicPlatforms/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicPlatformForm id={id} />
              )}
            />

            <Route path="/musicTracks" component={MusicTracks} />
            <Route path="/musicTracks/add" component={AddMusicTrackForm} />
            <Route
              path="/musicTracks/edit/:id"
              component={({ id }: { id: string }) => (
                <EditMusicTrackForm id={id} />
              )}
            />

            <Route default component={() => <h2>404 - Not Found</h2>} />
          </Router>
        </main>
      </div>
    </LocationProvider>
  );
}

const mountNode = document.getElementById("app");
render(<App />, mountNode!);
