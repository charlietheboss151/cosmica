# Body art sources

Planet sticker art is original to Cosmica. Moon, celestial-body, and spacecraft photos are public-domain NASA / ESA / JPL mission images (and a few museum or agency models) fetched from Wikimedia Commons and the NASA image library.

| Moon | Wikimedia file |
| --- | --- |
| Moon | Full_Moon_Luc_Viatour.jpg |
| Phobos | Phobos_colour_2008.jpg |
| Deimos | Deimos-MRO.jpg |
| Io | Io, moon of Jupiter, NASA.jpg |
| Europa | PIA19048 realistic color Europa mosaic edited.jpg |
| Ganymede | Ganymede, moon of Jupiter, NASA.jpg |
| Callisto | Callisto, moon of Jupiter, NASA.jpg |
| Mimas | Mimas Cassini.jpg |
| Enceladus | Enceladusstripes cassini-edit2.jpg |
| Tethys | Tethys from Cassini (1).jpg |
| Dione | Dione-from-Cassini(Nov-2004).jpg |
| Rhea | PIA07763 Rhea full globe5.jpg |
| Titan | Titan in true color.jpg |
| Iapetus | Iapetus as seen by the Cassini probe - 20071008.jpg |
| Miranda | Miranda mosaic in color - Voyager 2.png |
| Ariel | Ariel in monochrome.jpg |
| Umbriel | PIA00040 Umbrielx2.47.jpg |
| Titania | Titania (moon) color, cropped.jpg |
| Oberon | Voyager 2 picture of Oberon.jpg |
| Triton | Triton moon mosaic Voyager 2 (large).jpg |
| Charon | Charon in True Color - High-Res.jpg |
| Nix | Nix viewed from New Horizons 2015-07-14 (cropped).jpg |
| Hydra | Hydra true color map.png |
| Kerberos | Kerberos (moon).jpg |
| Styx | Styx (moon).jpg |
| Amalthea | NASA PIA07248 (left panel, rust-graded crop) |
| Hyperion | Hyperion false color.jpg |
| Phoebe | Phoebe closeup cassini NASA.jpg |
| Puck | Puck, moon of Uranus (1986).png |
| Proteus | Proteus (Voyager 2).jpg |
| Nereid | Nereid - Voyager 2.jpg |
| Dysnomia | Dysnomia-moon.png |
| Hi'iaka | Hi'iakaMoon.png |
| Namaka | Namaka Hubble.png |
| MK 2 | Makemake moon Hubble image only.jpg |

| Celestial body | Wikimedia file |
| --- | --- |
| Ceres | Ceres - RC3 - Haulani Crater (22381131691) (cropped).jpg |
| Pluto | Pluto in True Color - High-Res.jpg |
| Eris | Hubble ACS image of Eris.jpg |
| Haumea | 2003EL61art.jpg |
| Makemake | Dwarf Planet Makemake and Its Moon.jpg |
| Sedna | Sedna PRC2004-14d.png |
| Quaoar | Quaoar-weywot hst.jpg |
| Orcus | 90482 Orcus.jpg |
| Gonggong | 225088 Gonggong by Hubble (2009, colorized).png |
| Varuna | Varuna artistic.png |
| Ixion | Ixion planetoid nasa.jpg |
| Hygiea | SPHERE image of Hygiea.jpg |
| Vesta | Vesta as seen with the Dawn spacecraft (ann14003b).jpg |
| Pallas | Potw1749a Pallas crop.png |
| Psyche | Psyche VLT.png |
| Bennu | Bennu mosaic OSIRIS-REx (square).png |
| Ryugu | Ryugu colored.jpg |
| Ida | 243 ida.jpg |
| Gaspra | 951 Gaspra.jpg |
| Mathilde | (253) mathilde.jpg |
| Eros | Eros - PIA02923 (color).jpg |
| Itokawa | Itokawa06 hayabusa.jpg |
| Lutetia | An image of the strange asteroid Lutetia from the ESA Rosetta probe.jpg |
| Halley's Comet | Comet Halley close up.jpg |
| Hale-Bopp | The near-nucleus region of comet Hale-Bopp - Eso9624a.jpg |
| 67P | A Rosetta colour image of the surface of Comet 67P-Churyumov-Gerasimenko (49948151618).png |
| Tempel 1 | Deep Impact HRI - PIA02137.png |
| Wild 2 | Comet Wild2.jpg |
| Shoemaker-Levy 9 | Comet P-Shoemaker-Levy 9 (1994-43-206).jpg |

Cartoon asteroid sprite: `asteroid-rock.png` from [OpenClipart #323535](https://openclipart.org/detail/323535/asteroid) (public domain).

| Spacecraft | Source |
| --- | --- |
| Parker Solar Probe | Solar Probe Plus spacecraft on approach to the sun.jpg |
| Solar Orbiter | NASA SVS ESA_Solo_16.png |
| BepiColombo | BepiColombo spacecraft model.png |
| Akatsuki | Akatsuki CG01.png |
| ISS | ISS-56 International Space Station fly-around (07).jpg |
| Hubble | Hubble 2009 close-up 2.jpg |
| JWST | JWST spacecraft model 3.png |
| Chandra | Chandra artist illustration.jpg |
| Mars Reconnaissance Orbiter | Mars Reconnaissance Orbiter, front view, artist's concept (PIA07245).jpg |
| MAVEN | The MAVEN spacecraft and the limb of Mars.jpg |
| Hope | Emirates Mars Mission mockup at IAC 2021 01 (cropped).jpg |
| Mars Odyssey | NASA PIA04244 |
| Mars Express | Mars Express over Tharsis volcanoes.jpg |
| Tianwen-1 | Tianwen-1 schematic.png |
| Juno | NASA PIA16869 |
| JUICE | Juice launch kit cover close-up.png |
| Europa Clipper | Europa Clipper spacecraft model.png |
| Galileo | Galileo spacecraft model.png |
| Cassini | NASA PIA04233 |
| New Horizons | New Horizons spacecraft model 2.png |
| Voyager 1 | Voyager spacecraft.jpg |
| Voyager 2 | Voyager spacecraft.jpg |
| Pioneer 10 | Pioneer 10-11 spacecraft.jpg |
| Pioneer 11 | Pioneer 10 or 11 in outer solar system.jpg |
| Ulysses | Ulysses spacecraft model.png |
| Lucy | Lucy spacecraft model.png |
| Psyche | Psyche spacecraft model.png |

Regenerate PNGs with:

```bash
node scripts/fetch-moon-art.mjs
python scripts/process-amalthea.py
node scripts/fetch-celestial-art.mjs
node scripts/fetch-spacecraft-art.mjs
```

Spacecraft cutouts need Python packages: `pip install "rembg[cpu]" pillow numpy`.
