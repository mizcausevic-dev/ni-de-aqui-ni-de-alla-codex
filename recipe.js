/* Single source of truth: seconds, US fluid ounces, and the supplied recipe.
   The syrup is a prepared ingredient: no batch ratios were supplied. */
(function(root){
  const RECIPE = {
    title: 'Ni de Aquí Ni de Allá with Codex', duration: 30, fps: 30,
    credits: 'Danny González + Pedro Tobar · Bar Providencia',
    ingredients: [
      {id:'bourbon',name:'Bourbon',measure:'1 oz',oz:1,color:'#c57b20',start:8,end:10.8},
      {id:'mezcal',name:'Mezcal',measure:'1 oz',oz:1,color:'#e3c27e',start:10.8,end:13.6},
      {id:'plantain',name:'Plantain syrup',measure:'½ oz',oz:.5,color:'#c99737',start:13.6,end:16.4},
      {id:'angostura',name:'Angostura bitters',measure:'2 dashes',dashes:2,color:'#923819',start:16.4,end:18.6},
      {id:'banana',name:'Banana bitters',measure:'2 dashes',dashes:2,color:'#c78925',start:18.6,end:20.8}
    ],
    motion: {
      intro:[0,.8], leaf:[3.15,4.4], cube:[4.9,6.1], mixingIce:[6.65,7.8],
      setupTransition:[6.35,7.05], heroTransition:[24.8,26],
      strainPoseIn:[23,23.5], strainPoseOut:[24.7,25.3],
      mixingFadeIn:[6.35,6.9], mixingFadeOut:[24.85,25.5],
      stirIn:[20.8,21], stirOut:[22.7,23], strainFill:[23.3,24.8],
      strainFlowIn:[23.25,23.5], strainFlowOut:[24.65,24.95],
      garnishIn:[25,25.7], garnishOut:[26.3,26.8],
      ledgerIn:[7.8,8.2], ledgerOut:[24.7,25], heroFreeze:27
    },
    steps:[
      {id:'intro',start:0,end:3,title:'Ni de Aquí\nNi de Allá',detail:'with Codex',note:'Neither from here nor from there.'},
      {id:'leaf',start:3,end:4.8,title:'Banana leaf',detail:'Line the rocks glass',note:'Trim a fresh leaf to fit inside.'},
      {id:'cube',start:4.8,end:6.6,title:'One large\nice cube',detail:'Into the prepared glass',note:'Leaf-lined. Ice ready.'},
      {id:'mixice',start:6.6,end:8,title:'Mixing ice',detail:'Fill a separate mixing glass',note:'Build the cocktail here.'},
      {id:'stir',start:20.8,end:23,title:'Stir to chill',detail:'Stir until thoroughly chilled',note:'The large cube stays in the serving glass.'},
      {id:'strain',start:23,end:25,title:'Strain',detail:'Into the prepared rocks glass',note:'Keep the mixing ice behind.'},
      {id:'hero',start:25,end:30,title:'Ni de Aquí\nNi de Allá',detail:'with Codex',note:'Fresh banana leaf · the finishing touch'}
    ]
  };
  if(typeof module==='object') module.exports=RECIPE; else root.COCKTAIL_RECIPE=RECIPE;
})(typeof window==='object'?window:this);
