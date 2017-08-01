import * as React from 'react'
import Bounds from './Bounds'

// The default SVG text behavior is to put the text on *top* of the specified y coordinate
// Nothing else we do works like that though, so this wraps it to use the same spatial behavior
// as other componets

interface TextProps {
	x: number,
	y: number,
	fontSize?: string,
	fontFamily?: string,
	children: string
}

export default class Text extends React.Component<TextProps> {
	render() {
		const bounds = Bounds.forText(this.props.children, { fontSize: this.props['fontSize'], fontFamily: this.props['fontFamily'] })
		let {x, y} = this.props

        y = y+bounds.height-bounds.height*0.2

		return <text {...this.props} y={y} dominant-baseline={null} dangerouslySetInnerHTML={{__html: this.props.children}}/>
	}
}
