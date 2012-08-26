Node-RopeBuffer
===============

Zero-copy dynamic buffer, implemented by using a rope-like data-structure. (A
list of buffers, in case anybody is curious).

Reading and writing is done using a cursor and various functions working at the
cursor. Currently, `.seek()`, `.tell` and index-less versions of
`{read,write}{U,}Int{8,16,32}` is implemented.

Also, this is all very α.
