Duplicate diagnostics
=====================
tags: no-lang-runner
Get all parse errors
-----------------------------
* open "data/diagnostics/duplicate-concepts" and verify diagnostics

   |line|range_start|range_end|severity|message                                         |uri                                               |
   |----|-----------|---------|--------|------------------------------------------------|--------------------------------------------------|
   |3   |0          |10000    |1       |Duplicate concept definition found              |/specs/concepts/duplicateConcepts.cpt             |
* ensure diagnostics verified