Node-RopeBuffer
===============

Zero-copy dynamic buffer, implemented by using a rope-like data-structure. (A
list of buffers, in case anybody is curious).

Reading and writing is done using a cursor and various functions working at the
cursor. Currently, `.seek()`, `.tell` and index-less versions of
`{read,write}{U,}Int{8,16,32}` is implemented.

API
---

    var rb = new RopeBuffer(10); // Same initializers as regular buffers
	rb.tell; // = 0 - Reading/writing/seeking has happened.
	rb.writeUInt8(20); // Write something.
	rb.tell; // = 1 - Just wrote one byte.

	// Use absolute read/writes
	rb.readUInt8At(0); // = 20; Doesn't move cursor.
	rb.writeUInt8At(55, 0); // Overwrite first byte.

Most commands for writing/reading integers from buffers have been copied. As
seen in the example, two versions are exposed; the "plain" one, using a cursor
for indexing, and an `At`-suffixed version that uses absolute indices.

Also, this is all very α.
