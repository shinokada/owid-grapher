import * as _ from 'lodash'
import * as d3 from 'd3'
import * as React from 'react'
import {computed, action} from 'mobx'
import {observer} from 'mobx-react'
import Bounds from './Bounds'
import {preInstantiate} from './Util'
import Paragraph from './Paragraph'
import Text from './Text'
import ChartConfig from './ChartConfig'

interface SourcesFooterMainProps {
    x?: number,
    y?: number,
    maxWidth: number,
    sourcesText: string,
    notesText: string,
    licenseSvg: string,
    onSourcesClick: () => void
}

@observer
class SourcesFooterMain extends React.Component<SourcesFooterMainProps> {
    @computed get fontSize() {
        return 0.5
    }

    @computed get sources() {
        return preInstantiate(<Paragraph maxWidth={this.props.maxWidth} fontSize={this.fontSize}>{this.props.sourcesText}</Paragraph>)
    }

    @computed get notes() {
        return preInstantiate(<Paragraph maxWidth={this.props.maxWidth} fontSize={this.fontSize}>{this.props.notesText}</Paragraph>)
    }

    @computed get license() {
        const {licenseSvg} = this.props
        return preInstantiate(<Paragraph raw={true} maxWidth={this.props.maxWidth*3} fontSize={this.fontSize}>{licenseSvg}</Paragraph>)
    }

    // Put the license stuff to the side if there's room
    @computed get isCompact() {
        return this.props.maxWidth-this.sources.width-5 > this.license.width
    }

    @computed get paraMargin() {
        return 2
    }

    @computed get height() {
        const {sources, notes, license, isCompact, paraMargin} = this
        return sources.height+(notes.height ? paraMargin+notes.height : 0)+(isCompact ? 0 : paraMargin+license.height)
    }

    render() {
        const {props, sources, notes, license, isCompact, paraMargin} = this

        return <g className="SourcesFooter" style={{fill: "#777"}}>
            <a onClick={this.props.onSourcesClick} style={{fill: "#777"}}><Paragraph {...sources.props} x={props.x} y={props.y}/></a>
            <Paragraph {...notes.props} x={props.x} y={props.y+sources.height+paraMargin}/>
            {isCompact
                ? <Paragraph {...license.props} x={props.x+props.maxWidth-license.width} y={props.y}/>
                : <Paragraph {...license.props} x={props.x} y={props.y+sources.height+paraMargin+(notes.height ? notes.height+paraMargin : 0)}/>
            }
            {/*<CCIcon {...ccIcon.props} x={props.x+props.maxWidth-ccIcon.width-5} y={props.y+this.height-ccIcon.height-5}/>*/}
        </g>
    }
}

interface SourcesFooterProps {
    bounds: Bounds,
    chart: ChartConfig
}

export default class SourcesFooter extends React.Component<SourcesFooterProps> {
    @computed get defaultSourceDesc(): string {
       return _(this.props.chart.data.sources).map('name').uniq().join(",")
    }

    @computed get sourcesText(): string {
        const {chart} = this.props
        const sourceDesc = chart.sourceDesc || this.defaultSourceDesc
        return sourceDesc ? `Source: ${sourceDesc}` : ''
    }

    @computed get noteText(): string {
        return this.props.chart.note ? `Note: ${this.props.chart.note}` : '';
    }

    @computed get licenseSvg(): string {
        const {originUrl} = this.props.chart
        let licenseSvg = `*data-entry* • <a style="fill: #777;" href="http://creativecommons.org/licenses/by-sa/4.0/deed.en_US" target="_blank">CC BY-SA</a>`;

        // Make sure the link back to OWID is consistent
        if (originUrl && originUrl.indexOf("ourworldindata.org") !== -1) {
            const a = document.createElement('a')
            a.href = originUrl
            const path = a.pathname[0] == "/" ? a.pathname : "/" + a.pathname // MISPY: cross-browser compat (Internet Explorer doesn't have a slash)
            const finalUrl = `https://ourworldindata.org${path}${a.search}`
          licenseSvg = licenseSvg.replace(/\*data-entry\*/, "<a target='_blank' style='fill: #777;' href='" + finalUrl + "'>" + "OurWorldInData.org" + path + a.search + "</a>")
        } else {
          licenseSvg = licenseSvg.replace(/\*data-entry\*/,
                "<a target='_blank' style='fill: #777;' href='http://ourworldindata.org'>OurWorldInData.org</a>")
        }

        return licenseSvg;
    }

    @computed get footerMain() {
        const {sourcesText, noteText, licenseSvg} = this
        return preInstantiate(<SourcesFooterMain sourcesText={sourcesText} notesText={noteText} licenseSvg={licenseSvg} maxWidth={this.props.bounds.width} onSourcesClick={this.onSourcesClick}/>)
    }

    @computed get height() {
        return this.footerMain.height
    }

    @action.bound onSourcesClick() {
        this.props.chart.tab = 'sources'
    }

    render() {
        const {props, footerMain} = this
        return <SourcesFooterMain {...footerMain.props} x={props.bounds.left} y={props.bounds.bottom-footerMain.height}/>
    }
}
