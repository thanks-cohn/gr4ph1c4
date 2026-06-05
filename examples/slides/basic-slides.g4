slides basic_slides "GR4PH1C4 Slides Basic Demo" {
  cartridge: "portable HTML cartridge"
  output: "local folder with index.html, CSS, JS, manifest, proof, and tests"

  slide 1 "HTML cartridge title and text boxes" {
    title_box: "GR4PH1C4 Slides Basic Demo"
    text_box: "A student opens index.html from file:// and presents immediately."
    feature: "Title and text boxes"
  }

  slide 2 "Media placeholder boxes" {
    image_placeholder: "local SVG mountain icon"
    video_placeholder: "local SVG play frame"
    audio_placeholder: "local SVG speaker wave"
    feature: "Image, video, and audio placeholder boxes"
  }

  slide 3 "Bar chart object" {
    bar_chart: Alpha=12, Beta=28, Gamma=19
    editor_panel: collapsible
    feature: "Bar chart object"
  }

  slide 4 "Line graph object" {
    line_graph: Jan=5, Feb=11, Mar=7, Apr=18
    editor_panel: collapsible
    feature: "Line graph object"
  }

  slide 5 "3D object box" {
    object_3d: "cube"
    fallback: "CSS pseudo-3D cube when local Three.js is unavailable"
    feature: "3D object box with cube or fallback cube"
  }

  slide 6 "Checkpoints" {
    checkpoint_name_input: true
    save_checkpoint_button: true
    restore_original_button: true
    storage: "localStorage key gr4ph1c4_slides_basic_checkpoints"
    feature: "Checkpoints"
  }

  slide 7 "Future forms" {
    flow: "choose type -> enter values -> minimize editor -> present"
    options: chart, graph, 3D
    feature: "Future form-driven editing flow"
  }
}
